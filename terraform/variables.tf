variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Target AWS Region"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment"
}

variable "ec2_ami_id" {
  type        = string
  default     = "ami-0c7217cdde317cfec"
  description = "Ubuntu LTS base AMI"
}

variable "instance_type" {
  type        = string
  default     = "t3.medium"
  description = "Default EC2 instance type"
}
