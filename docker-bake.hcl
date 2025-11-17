group "default" {
    targets = ["frontend", "api", "games", "notification", "ai-companion", "push-notification", "sms", "email"]
}

variable "DOCKER_USERNAME" {
    default = "minmin20" # change to own username when using
}

target "frontend" {
    context = "./frontend"
    dockerfile = "Dockerfile"
    tags = ["${DOCKER_USERNAME}/senior-care:frontend-latest"]
    platforms = ["linux/amd64"]
}

target "api" {
    context = "./api"
    dockerfile = "Dockerfile"
    tags = ["${DOCKER_USERNAME}/senior-care:api-gateway-latest"]
    platforms = ["linux/amd64"]
}

target "games" {
    context = "./games-service"
    dockerfile = "Dockerfile"
    tags = ["${DOCKER_USERNAME}/senior-care:games-service-latest"]
    platforms = ["linux/amd64"]
}

target "notification" {
    context = "./backend"
    dockerfile = "./services/notification-service/Dockerfile"
    tags = ["${DOCKER_USERNAME}/senior-care:notification-service-latest"]
    platforms = ["linux/amd64"]
}

target "ai-companion" {
    context = "./backend"
    dockerfile = "./services/ai-companion-service/Dockerfile"
    tags = ["${DOCKER_USERNAME}/senior-care:ai-companion-service-latest"]
    platforms = ["linux/amd64"]
}
