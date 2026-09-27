terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. VPC & Networking
resource "aws_vpc" "cloudops_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "cloudops-core-vpc"
    Environment = var.environment
    ManagedBy   = "AI-CloudOps-Manager"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.cloudops_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "cloudops-public-subnet-1"
  }
}

# 2. EC2 Web Server Cluster
resource "aws_instance" "prod_server_01" {
  ami           = var.ec2_ami_id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public_subnet.id

  tags = {
    Name        = "prod-server-01"
    Environment = "production"
    Tier        = "web-api"
    Team        = "platform-core"
    AutoScale   = "true"
  }
}

# 3. CloudWatch High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu_alarm" {
  alarm_name          = "cloudops-prod-server-01-high-cpu"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "Triggered when CPU exceeds 85% for 10 minutes"
  
  dimensions = {
    InstanceId = aws_instance.prod_server_01.id
  }
}

# 4. S3 Storage Bucket with Intelligent-Tiering
resource "aws_s3_bucket" "media_assets" {
  bucket = "ai-cloudops-media-assets-${var.environment}"

  tags = {
    Environment = "production"
    DataTier    = "static-assets"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media_lifecycle" {
  bucket = aws_s3_bucket.media_assets.id

  rule {
    id     = "auto-intelligent-tiering"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }

    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }
  }
}
