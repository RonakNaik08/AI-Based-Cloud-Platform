output "vpc_id" {
  value       = aws_vpc.cloudops_vpc.id
  description = "CloudOps VPC ID"
}

output "prod_server_id" {
  value       = aws_instance.prod_server_01.id
  description = "Production Server 01 Instance ID"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.media_assets.arn
  description = "S3 Bucket ARN"
}
