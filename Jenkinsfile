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

                bat '''
                "C:\\Users\\M680499\\AppData\\Local\\Programs\\Python\\Python314\\python.exe" -m pytest test.py -v
                '''

            }
        }


        stage('Create Artifact') {
            steps {

                bat '''
                powershell -Command "Compress-Archive -Path app.py,routes,services,static,templates,embeddings,requirements.txt,test.py -DestinationPath sccm-chatbot-build.zip -Force"
                '''

            }
        }


        stage('DEV Approval') {
            steps {

                input message: 'Testing completed. Approve deployment to DEV?', ok: 'Deploy to DEV'

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

                        $cred = New-Object System.Management.Automation.PSCredential(
                            $username,
                            $password
                        )

                        Write-Host "Connecting to DEV server..."

                        New-PSDrive `
                            -Name "DEV" `
                            -PSProvider FileSystem `
                            -Root "\\\\Lab-VM3\\C$" `
                            -Credential $cred

                        Write-Host "Creating DEV application directory..."

                        New-Item `
                            -Path "DEV:\\CICD\\DEV\\SCCM-AI-Software-Assistant" `
                            -ItemType Directory `
                            -Force

                        Write-Host "Copying chatbot artifact..."

                        Copy-Item `
                            "sccm-chatbot-build.zip" `
                            "DEV:\\CICD\\DEV\\SCCM-AI-Software-Assistant\\sccm-chatbot-build.zip" `
                            -Force

                        Write-Host "Artifact copied to Lab-VM3"

                        Remove-PSDrive -Name "DEV"

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

                        $cred = New-Object System.Management.Automation.PSCredential(
                            $username,
                            $password
                        )

                        Write-Host "Deploying application on Lab-VM3..."

                        Invoke-Command `
                            -ComputerName Lab-VM3 `
                            -Credential $cred `
                            -Authentication Kerberos `
                            -ScriptBlock {

                                $appPath = "C:\\CICD\\DEV\\SCCM-AI-Software-Assistant"

                                Write-Host "Extracting chatbot artifact..."

                                Expand-Archive `
                                    -Path "$appPath\\sccm-chatbot-build.zip" `
                                    -DestinationPath $appPath `
                                    -Force

                                Write-Host "Creating Python virtual environment..."

                                if (-not (Test-Path "$appPath\\venv")) {

                                    python -m venv "$appPath\\venv"

                                }

                                Write-Host "Installing Python dependencies..."

                                & "$appPath\\venv\\Scripts\\python.exe" `
                                    -m pip install `
                                    -r "$appPath\\requirements.txt"

                                Write-Host "Chatbot application deployed successfully."

                            }

                    '''
                }
            }
        }


        stage('Configure DEV Environment') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dev-server-credential',
                        usernameVariable: 'DEV_USERNAME',
                        passwordVariable: 'DEV_PASSWORD'
                    ),
                    string(
                        credentialsId: 'gemini-api-key',
                        variable: 'GEMINI_API_KEY'
                    )
                ]) {

                    powershell '''

                        $username = $env:DEV_USERNAME

                        $password = ConvertTo-SecureString `
                            $env:DEV_PASSWORD `
                            -AsPlainText `
                            -Force

                        $cred = New-Object System.Management.Automation.PSCredential(
                            $username,
                            $password
                        )

                        Write-Host "Configuring DEV environment..."

                        Invoke-Command `
                            -ComputerName Lab-VM3 `
                            -Credential $cred `
                            -Authentication Kerberos `
                            -ArgumentList $env:GEMINI_API_KEY `
                            -ScriptBlock {

                                param(
                                    $GeminiKey
                                )

                                $appPath = "C:\\CICD\\DEV\\SCCM-AI-Software-Assistant"

                                $envContent = "GEMINI_API_KEY=$GeminiKey"

                                Set-Content `
                                    -Path "$appPath\\.env" `
                                    -Value $envContent `
                                    -Encoding UTF8

                                Write-Host "DEV .env configured."

                            }

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

                        $cred = New-Object System.Management.Automation.PSCredential(
                            $username,
                            $password
                        )

                        Write-Host "Starting SCCM chatbot on Lab-VM3..."

                        Invoke-Command `
                            -ComputerName Lab-VM3 `
                            -Credential $cred `
                            -ScriptBlock {

                                $appPath = "C:\\CICD\\DEV\\SCCM-AI-Software-Assistant"

                                Start-Process `
                                    -FilePath "$appPath\\venv\\Scripts\\python.exe" `
                                    -ArgumentList "$appPath\\app.py" `
                                    -WorkingDirectory $appPath `
                                    -WindowStyle Hidden

                                Write-Host "SCCM chatbot started."

                            }

                    '''
                }
            }
        }


        stage('DEV Approval for QA') {
            steps {

                input message: 'DEV deployment completed. Approve deployment to QA?', ok: 'Deploy to QA'

            }
        }


        stage('Deploy QA') {
            steps {

                echo 'QA deployment stage will be configured next.'

            }
        }

    }
}