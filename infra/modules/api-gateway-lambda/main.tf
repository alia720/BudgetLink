locals {
  lambda_environment_variables = {
    DYNAMODB_TABLE = var.dynamodb_table_name
    ENVIRONMENT    = var.environment
    FRONTEND_URL   = var.frontend_url != null ? var.frontend_url : "https://d2dg9h9pxuakpb.cloudfront.net"
  }
}

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
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem"
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })
}

# Lambda S3 policy
resource "aws_iam_role_policy" "lambda_s3" {
  name = "budgetlink-lambda-s3-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.lambda_code.arn,
          "${aws_s3_bucket.lambda_code.arn}/*"
        ]
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

# Budget Management Lambda Functions
resource "aws_lambda_function" "budget_create" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-budget-create-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/budget/create.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

resource "aws_lambda_function" "budget_get" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-budget-get-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/budget/get.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

resource "aws_lambda_function" "budget_update" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-budget-update-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/budget/update.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

resource "aws_lambda_function" "budget_delete" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-budget-delete-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/budget/delete.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

# Expense Management Lambda Functions
resource "aws_lambda_function" "expense_create" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-expense-createE-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/expense/createE.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

resource "aws_lambda_function" "expense_get" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-expense-getE-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/expense/getE.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

resource "aws_lambda_function" "expense_update" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-expense-updateE-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/expense/updateE.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

resource "aws_lambda_function" "expense_delete" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-expense-deleteE-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/expense/deleteE.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

# Auth Lambda Functions
resource "aws_lambda_function" "auth_authenticate" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-auth-authenticate-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/auth/authenticate.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

resource "aws_lambda_function" "auth_validate_session" {
  s3_bucket         = aws_s3_bucket.lambda_code.id
  s3_key            = "budget.zip"
  function_name    = "budgetlink-auth-validate-session-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/handlers/auth/validate-session.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = local.lambda_environment_variables
  }
}

# API Gateway Integrations
resource "aws_apigatewayv2_integration" "budget_create" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Create budget Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.budget_create.invoke_arn
}

resource "aws_apigatewayv2_integration" "budget_get" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Get budget Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.budget_get.invoke_arn
}

resource "aws_apigatewayv2_integration" "budget_update" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Update budget Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.budget_update.invoke_arn
}

resource "aws_apigatewayv2_integration" "budget_delete" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Delete budget Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.budget_delete.invoke_arn
}

resource "aws_apigatewayv2_integration" "expense_create" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Create expense Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.expense_create.invoke_arn
}

resource "aws_apigatewayv2_integration" "expense_get" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Get expense Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.expense_get.invoke_arn
}

resource "aws_apigatewayv2_integration" "expense_update" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Update expense Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.expense_update.invoke_arn
}

resource "aws_apigatewayv2_integration" "expense_delete" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Delete expense Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.expense_delete.invoke_arn
}

resource "aws_apigatewayv2_integration" "auth_authenticate" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Authenticate Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.auth_authenticate.invoke_arn
}

resource "aws_apigatewayv2_integration" "auth_validate_session" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  description      = "Validate session Lambda integration"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.auth_validate_session.invoke_arn
}

# API Gateway Routes
resource "aws_apigatewayv2_route" "budget_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /budgets"
  target    = "integrations/${aws_apigatewayv2_integration.budget_create.id}"
}

resource "aws_apigatewayv2_route" "budget_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /budgets/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.budget_get.id}"
}

resource "aws_apigatewayv2_route" "budget_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /budgets/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.budget_update.id}"
}

resource "aws_apigatewayv2_route" "budget_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /budgets/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.budget_delete.id}"
}

resource "aws_apigatewayv2_route" "expense_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /budgets/{slug}/expenses"
  target    = "integrations/${aws_apigatewayv2_integration.expense_create.id}"
}

resource "aws_apigatewayv2_route" "expense_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /budgets/{slug}/expenses/{expenseId}"
  target    = "integrations/${aws_apigatewayv2_integration.expense_get.id}"
}

resource "aws_apigatewayv2_route" "expense_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /budgets/{slug}/expenses/{expenseId}"
  target    = "integrations/${aws_apigatewayv2_integration.expense_update.id}"
}

resource "aws_apigatewayv2_route" "expense_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /budgets/{slug}/expenses/{expenseId}"
  target    = "integrations/${aws_apigatewayv2_integration.expense_delete.id}"
}

resource "aws_apigatewayv2_route" "auth_authenticate" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/authenticate"
  target    = "integrations/${aws_apigatewayv2_integration.auth_authenticate.id}"
}

resource "aws_apigatewayv2_route" "auth_validate_session" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/validate-session"
  target    = "integrations/${aws_apigatewayv2_integration.auth_validate_session.id}"
}

# Lambda Permissions
resource "aws_lambda_permission" "budget_create" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.budget_create.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "budget_get" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.budget_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "budget_update" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.budget_update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "budget_delete" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.budget_delete.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "expense_create" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense_create.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "expense_get" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "expense_update" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense_update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "expense_delete" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expense_delete.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "auth_authenticate" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_authenticate.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "auth_validate_session" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_validate_session.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
} 