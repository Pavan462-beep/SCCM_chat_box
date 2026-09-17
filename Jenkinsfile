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

                        Write-Host "Connecting to DEV server..."

                        New-PSDrive `
                            -Name "DEV" `
                            -PSProvider FileSystem `
                            -Root "\\\\Lab-VM3\\C$" `
                            -Credential $cred

                        Write-Host "Copying SCCM chatbot artifact..."

                        Copy-Item `
                            "sccm-chatbot-build.zip" `
                            "DEV:\\CICD\\DEV\\sccm-chatbot-build.zip" `
                            -Force

                        Write-Host "Artifact copied to Lab-VM3."

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

                        Write-Host "Deploying SCCM chatbot to DEV..."

                        Invoke-Command `
                            -ComputerName Lab-VM3 `
                            -Credential $cred `
                            -Authentication Kerberos `
                            -ScriptBlock {

                                Write-Host "Extracting chatbot artifact..."

                                Expand-Archive `
                                    -Path "C:\\CICD\\DEV\\sccm-chatbot-build.zip" `
                                    -DestinationPath "C:\\CICD\\DEV\\SCCM_chat_box" `
                                    -Force

                                Write-Host "Creating Python virtual environment..."

                                Set-Location `
                                    "C:\\CICD\\DEV\\SCCM_chat_box"

                                if (Test-Path "venv") {

                                    Write-Host "Existing virtual environment found."

                                }
                                else {

                                    Write-Host "Creating new virtual environment..."

                                    & "C:\\Users\\M680499\\AppData\\Local\\Programs\\Python\\Python314\\python.exe" `
                                        -m venv venv
                                }

                                Write-Host "Installing Python dependencies..."

                                & ".\\venv\\Scripts\\python.exe" `
                                    -m pip install -r requirements.txt

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

                        Write-Host "Configuring DEV environment..."

                        Invoke-Command `
                            -ComputerName Lab-VM3 `
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

                        Write-Host "Starting SCCM chatbot on DEV..."

                        Invoke-Command `
                            -ComputerName Lab-VM3 `
                            -Credential $cred `
                            -Authentication Kerberos `
                            -ScriptBlock {

                                $applicationPath = "C:\\CICD\\DEV\\SCCM_chat_box"

                                Set-Location `
                                    $applicationPath

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

                                Write-Host "SCCM chatbot DEV application started."

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

                /*
                 * QA deployment can be added here.
                 *
                 * Example:
                 *
                 * Copy artifact to QA server
                 * Create virtual environment
                 * Install requirements
                 * Configure Gemini API key
                 * Start application
                 */
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