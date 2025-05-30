output "api_url" {
  description = "The URL of the API Gateway"
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/${aws_apigatewayv2_stage.main.name}"
}

output "lambda_function_name" {
  description = "The name of the Lambda function"
  value       = aws_lambda_function.create_budget.function_name
}

output "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  value       = var.dynamodb_table_name
}

output "lambda_role_arn" {
  description = "ARN of the Lambda IAM role"
  value       = aws_iam_role.lambda_role.arn
} 