terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    # These values will be filled in by the user
    # bucket         = "budgetlink-terraform-state"
    # key            = "terraform.tfstate"
    # region         = "us-east-1"
    # dynamodb_table = "budgetlink-terraform-locks"
    # encrypt        = true
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

# Outputs
output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = module.api_gateway.api_url
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = module.dynamodb.table_name
} 