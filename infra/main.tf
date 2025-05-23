terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "budgetlink-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "budgetlink-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "BudgetLink"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

# Module declarations
module "s3_frontend" {
  source = "./modules/s3-frontend"
  environment = var.environment
}

module "dynamodb" {
  source = "./modules/dynamodb"
  environment = var.environment
}

module "api_gateway_lambda" {
  source = "./modules/api-gateway-lambda"
  environment = var.environment
  dynamodb_table_name = module.dynamodb.table_name
  dynamodb_table_arn = module.dynamodb.table_arn
}

# Outputs
output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = module.api_gateway_lambda.api_url
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = module.dynamodb.table_name
} 