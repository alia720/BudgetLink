output "api_url" {
  description = "The URL of the API Gateway"
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/${aws_apigatewayv2_stage.main.name}"
}

output "lambda_function_names" {
  description = "Names of all Lambda functions"
  value = {
    budget_create = aws_lambda_function.budget_create.function_name
    budget_get    = aws_lambda_function.budget_get.function_name
    budget_update = aws_lambda_function.budget_update.function_name
    budget_delete = aws_lambda_function.budget_delete.function_name
    expense_create = aws_lambda_function.expense_create.function_name
    expense_get    = aws_lambda_function.expense_get.function_name
    expense_update = aws_lambda_function.expense_update.function_name
    expense_delete = aws_lambda_function.expense_delete.function_name
    auth_authenticate = aws_lambda_function.auth_authenticate.function_name
    auth_validate_session = aws_lambda_function.auth_validate_session.function_name
  }
}

output "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  value       = var.dynamodb_table_name
}

output "lambda_role_arn" {
  description = "ARN of the Lambda IAM role"
  value       = aws_iam_role.lambda_role.arn
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for Lambda code"
  value       = aws_s3_bucket.lambda_code.id
} 