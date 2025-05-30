resource "aws_apigatewayv2_api" "main" {
  name          = "budgetlink-api-${var.environment}"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "main" {
  api_id = aws_apigatewayv2_api.main.id
  name   = var.environment
  auto_deploy = true
}

# Lambda IAM role
resource "aws_iam_role" "lambda_role" {
  name = "budgetlink-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda DynamoDB policy
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "budgetlink-lambda-dynamodb-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })
}

# S3 bucket for Lambda code
resource "aws_s3_bucket" "lambda_code" {
  bucket = "budgetlink-lambda-code-${var.environment}"
}

resource "aws_s3_bucket_versioning" "lambda_code" {
  bucket = aws_s3_bucket.lambda_code.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Budget creation Lambda function
resource "aws_lambda_function" "create_budget" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-create-budget-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/budget.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = {
      DYNAMODB_TABLE = var.dynamodb_table_name
      ENVIRONMENT    = var.environment
    }
  }
}

# Add S3 permissions to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

# API Gateway integration with create budget Lambda
resource "aws_apigatewayv2_integration" "create_budget" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  description        = "Create budget Lambda integration"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.create_budget.invoke_arn
}

# API Gateway route for budget creation
resource "aws_apigatewayv2_route" "create_budget" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /budgets"
  target    = "integrations/${aws_apigatewayv2_integration.create_budget.id}"
}

# Lambda permission for create budget
resource "aws_lambda_permission" "create_budget" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_budget.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Get budget Lambda function
resource "aws_lambda_function" "get_budget" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-get-budget-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/get-budget.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = {
      DYNAMODB_TABLE = var.dynamodb_table_name
      ENVIRONMENT    = var.environment
    }
  }
}

# API Gateway integration with get budget Lambda
resource "aws_apigatewayv2_integration" "get_budget" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  description        = "Get budget Lambda integration"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.get_budget.invoke_arn
}

# API Gateway route for getting a budget
resource "aws_apigatewayv2_route" "get_budget" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /budgets/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.get_budget.id}"
}

# Lambda permission for get budget
resource "aws_lambda_permission" "get_budget" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_budget.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Expense Management Lambda
resource "aws_lambda_function" "expense" {
  function_name = "${var.environment}-expense"
  role          = aws_iam_role.lambda_role.arn
  handler       = "src/expense.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  s3_bucket = aws_s3_bucket.lambda_code.id
  s3_key    = "budget.zip"

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.budgetlink.name
    }
  }
}

# API Gateway routes for expense management
resource "aws_apigatewayv2_route" "expense_post" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /budget/{slug}/expense"
  target    = "integrations/${aws_apigatewayv2_integration.expense.id}"
}

resource "aws_apigatewayv2_route" "expense_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /budget/{slug}/expense"
  target    = "integrations/${aws_apigatewayv2_integration.expense.id}"
}

resource "aws_apigatewayv2_route" "expense_put" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /budget/{slug}/expense"
  target    = "integrations/${aws_apigatewayv2_integration.expense.id}"
}

resource "aws_apigatewayv2_route" "expense_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /budget/{slug}/expense/{expenseId}"
  target    = "integrations/${aws_apigatewayv2_integration.expense.id}"
}

# API Gateway integration for expense management
resource "aws_apigatewayv2_integration" "expense" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  description        = "Expense management integration"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.expense.invoke_arn
}

# Lambda permissions for expense management
resource "aws_lambda_permission" "expense_post" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "expense_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "expense_put" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "expense_delete" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
} 