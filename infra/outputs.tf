output "frontend_url" {
  description = "URL of the frontend application"
  value       = module.s3_frontend.cloudfront_domain
}

output "api_url" {
  description = "URL of the API Gateway endpoint"
  value       = module.api_gateway_lambda.api_url
}
