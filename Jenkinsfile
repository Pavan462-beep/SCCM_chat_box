pipeline {

    agent any

    stages {

        stage('Build') {
            steps {
                echo 'Building SCCM AI Software Assistant'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                    "C:\\Users\\M680499\\AppData\\Local\\Programs\\Python\\Python314\\python.exe" -m pip install -r requirements.txt
                '''
            }
        }

        stage('Test') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'gemini-api-key',
                        variable: 'GEMINI_API_KEY'
                    )
                ]) {
                    bat '''
                        "C:\\Users\\M680499\\AppData\\Local\\Programs\\Python\\Python314\\python.exe" -m pytest test.py -v
                    '''
                }
            }
        }

        stage('Create Artifact') {
            steps {
                powershell '''
                    Compress-Archive `
                        -Path app.py,routes,services,static,templates,embeddings,requirements.txt,test.py `
                        -DestinationPath sccm-chatbot-build.zip `
                        -Force

                    Write-Host "SCCM chatbot artifact created."
                '''
            }
        }

        stage('DEV Approval') {
            steps {
                input message: 'Testing completed. Approve deployment to DEV?',
                      ok: 'Deploy to DEV'
            }
        }

        stage('Deploy DEV') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dev-server-credential',
                        usernameVariable: 'DEV_USERNAME',
                        passwordVariable: 'DEV_PASSWORD'
                    )
                ]) {
                    powershell '''
                        $username = $env:DEV_USERNAME

                        $password = ConvertTo-SecureString `
                            $env:DEV_PASSWORD `
                            -AsPlainText `
                            -Force

                        $cred = New-Object `
                            System.Management.Automation.PSCredential(
                                $username,
                                $password
                            )

                        Write-Host "Connecting to DEV server Lab-VM4..."

                        New-PSDrive `
                            -Name "DEV" `
                            -PSProvider FileSystem `
                            -Root "\\\\Lab-VM4\\C$" `
                            -Credential $cred

                        Write-Host "Copying SCCM chatbot artifact..."

                        if (-not (Test-Path "DEV:\\CICD\\DEV")) {
                            New-Item `
                                -Path "DEV:\\CICD\\DEV" `
                                -ItemType Directory `
                                -Force
                        }

                        Copy-Item `
                            "sccm-chatbot-build.zip" `
                            "DEV:\\CICD\\DEV\\sccm-chatbot-build.zip" `
                            -Force

                        Write-Host "Artifact copied to Lab-VM4."

                        Remove-PSDrive `
                            -Name "DEV"
                    '''
                }
            }
        }

        stage('Deploy DEV Application') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dev-server-credential',
                        usernameVariable: 'DEV_USERNAME',
                        passwordVariable: 'DEV_PASSWORD'
                    )
                ]) {
                    powershell '''
                        $username = $env:DEV_USERNAME

                        $password = ConvertTo-SecureString `
                            $env:DEV_PASSWORD `
                            -AsPlainText `
                            -Force

                        $cred = New-Object `
                            System.Management.Automation.PSCredential(
                                $username,
                                $password
                            )

                        Write-Host "Deploying SCCM chatbot to Lab-VM4 DEV..."

                        Invoke-Command `
                            -ComputerName Lab-VM4 `
                            -Credential $cred `
                            -Authentication Kerberos `
                            -ScriptBlock {

                                $applicationPath = "C:\\CICD\\DEV\\SCCM_chat_box"

                                Write-Host "Creating DEV application directory..."

                                if (-not (Test-Path $applicationPath)) {
                                    New-Item `
                                        -Path $applicationPath `
                                        -ItemType Directory `
                                        -Force
                                }

                                Write-Host "Extracting chatbot artifact..."

                                Expand-Archive `
                                    -Path "C:\\CICD\\DEV\\sccm-chatbot-build.zip" `
                                    -DestinationPath $applicationPath `
                                    -Force

                                Write-Host "Checking application files..."

                                if (-not (Test-Path "$applicationPath\\app.py")) {
                                    Write-Error "app.py was not found after extraction."
                                    exit 1
                                }

                                Write-Host "Creating Python virtual environment..."

                                if (Test-Path "$applicationPath\\venv") {
                                    Write-Host "Existing virtual environment found."
                                }
                                else {
                                    & "C:\\Users\\M680499\\AppData\\Local\\Programs\\Python\\Python314\\python.exe" `
                                        -m venv "$applicationPath\\venv"
                                }

                                Write-Host "Installing Python dependencies..."

                                & "$applicationPath\\venv\\Scripts\\python.exe" `
                                    -m pip install -r "$applicationPath\\requirements.txt"

                                Write-Host "DEV application deployment completed."

                            }
                    '''
                }
            }
        }

        stage('Configure DEV Environment') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'gemini-api-key',
                        variable: 'GEMINI_API_KEY'
                    ),
                    usernamePassword(
                        credentialsId: 'dev-server-credential',
                        usernameVariable: 'DEV_USERNAME',
                        passwordVariable: 'DEV_PASSWORD'
                    )
                ]) {
                    powershell '''
                        $username = $env:DEV_USERNAME

                        $password = ConvertTo-SecureString `
                            $env:DEV_PASSWORD `
                            -AsPlainText `
                            -Force

                        $cred = New-Object `
                            System.Management.Automation.PSCredential(
                                $username,
                                $password
                            )

                        Write-Host "Configuring DEV environment on Lab-VM4..."

                        Invoke-Command `
                            -ComputerName Lab-VM4 `
                            -Credential $cred `
                            -Authentication Kerberos `
                            -ScriptBlock {

                                param(
                                    $GeminiKey
                                )

                                $applicationPath = "C:\\CICD\\DEV\\SCCM_chat_box"

                                $envFile = Join-Path `
                                    $applicationPath `
                                    ".env"

                                Write-Host "Creating DEV .env file..."

                                Set-Content `
                                    -Path $envFile `
                                    -Value "GEMINI_API_KEY=$GeminiKey" `
                                    -Encoding UTF8

                                Write-Host "DEV environment configured."

                            } `
                            -ArgumentList $env:GEMINI_API_KEY
                    '''
                }
            }
        }

        stage('Start DEV Application') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dev-server-credential',
                        usernameVariable: 'DEV_USERNAME',
                        passwordVariable: 'DEV_PASSWORD'
                    )
                ]) {
                    powershell '''
                        $username = $env:DEV_USERNAME

                        $password = ConvertTo-SecureString `
                            $env:DEV_PASSWORD `
                            -AsPlainText `
                            -Force

                        $cred = New-Object `
                            System.Management.Automation.PSCredential(
                                $username,
                                $password
                            )

                        Write-Host "Starting SCCM chatbot on Lab-VM4..."

                        Invoke-Command `
                            -ComputerName Lab-VM4 `
                            -Credential $cred `
                            -Authentication Kerberos `
                            -ScriptBlock {

                                $applicationPath = "C:\\CICD\\DEV\\SCCM_chat_box"

                                Set-Location $applicationPath

                                Write-Host "Checking existing Flask process..."

                                $existingProcess = Get-CimInstance `
                                    Win32_Process `
                                    -Filter "Name = 'python.exe'" |
                                    Where-Object {
                                        $_.CommandLine -like "*app.py*"
                                    }

                                if ($existingProcess) {

                                    Write-Host "Existing chatbot process found."

                                    foreach ($process in $existingProcess) {

                                        Stop-Process `
                                            -Id $process.ProcessId `
                                            -Force `
                                            -ErrorAction SilentlyContinue

                                    }

                                    Start-Sleep -Seconds 2
                                }

                                Write-Host "Starting Flask application..."

                                Start-Process `
                                    -FilePath "$applicationPath\\venv\\Scripts\\python.exe" `
                                    -ArgumentList "app.py" `
                                    -WorkingDirectory $applicationPath `
                                    -WindowStyle Hidden

                                Start-Sleep -Seconds 5

                                Write-Host "SCCM chatbot DEV application started on Lab-VM4."

                            }
                    '''
                }
            }
        }

        stage('DEV Approval for QA') {
            steps {
                input message: 'DEV testing completed. Approve deployment to QA?',
                      ok: 'Deploy to QA'
            }
        }

        stage('Deploy QA') {
            steps {
                echo 'QA deployment stage is ready.'
            }
        }
    }

    post {

        success {
            echo 'SCCM AI Software Assistant pipeline completed successfully.'
        }

        failure {
            echo 'SCCM AI Software Assistant pipeline failed.'
        }

        always {
            echo 'Jenkins pipeline execution completed.'
        }
    }
}