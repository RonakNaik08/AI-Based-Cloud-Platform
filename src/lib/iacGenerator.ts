import { CloudResource } from './types';

export class IaCGenerator {
  public generateTerraform(resources: CloudResource[]): string {
    if (resources.length === 0) {
      return `# No resources configured in AI CloudOps. Add resources to generate Terraform configuration.\nterraform {\n  required_version = ">= 1.5.0"\n}`;
    }

    let code = `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "azurerm" {
  features {}
}

provider "google" {
  project = "cloudops-core-project"
  region  = "us-central1"
}

# ==========================================
# PROVISIONED INFRASTRUCTURE AS CODE
# ==========================================
`;

    resources.forEach((r) => {
      const safeName = r.name.replace(/[^a-zA-Z0-9_]/g, '_');

      if (r.type === 'ec2') {
        code += `
# AWS EC2 Instance: ${r.name}
resource "aws_instance" "${safeName}" {
  ami           = "ami-0c7217cdde317cfec" # Amazon Linux 2023
  instance_type = "${r.instanceType || 't3.medium'}"
  tags = {
    Name        = "${r.name}"
    Environment = "${r.tags.Environment || 'production'}"
    ManagedBy   = "AI-CloudOps"
  }
}
`;
      } else if (r.type === 'azure_vm') {
        code += `
# Azure Virtual Machine: ${r.name}
resource "azurerm_linux_virtual_machine" "${safeName}" {
  name                = "${r.name}"
  resource_group_name = "rg-cloudops-prod"
  location            = "${r.region || 'eastus'}"
  size                = "${r.instanceType || 'Standard_D4s_v5'}"
  admin_username      = "cloudopsadmin"
  network_interface_ids = [azurerm_network_interface.${safeName}_nic.id]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}
`;
      } else if (r.type === 'gcp_vm') {
        code += `
# Google Cloud Compute Engine: ${r.name}
resource "google_compute_instance" "${safeName}" {
  name         = "${r.name}"
  machine_type = "${r.instanceType || 'n2-standard-4'}"
  zone         = "${r.region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }
}
`;
      } else if (r.type === 'rds') {
        code += `
# AWS RDS Managed Database: ${r.name}
resource "aws_db_instance" "${safeName}" {
  identifier        = "${r.name}"
  allocated_storage = ${r.details?.storageGb || 100}
  engine            = "postgres"
  engine_version    = "16.2"
  instance_class    = "${r.instanceType || 'db.r6g.xlarge'}"
  username          = "dbadmin"
  password          = var.db_password
  skip_final_snapshot = true
}
`;
      } else if (r.type === 's3') {
        code += `
# AWS S3 Bucket: ${r.name}
resource "aws_s3_bucket" "${safeName}" {
  bucket = "${r.name}"

  tags = {
    Environment = "production"
    Tier        = "storage"
  }
}
`;
      }
    });

    return code;
  }

  public generateCloudFormation(resources: CloudResource[]): string {
    let yaml = `AWSTemplateFormatVersion: '2010-09-09'
Description: 'AI CloudOps Exported Infrastructure Template'

Resources:
`;
    resources.filter((r) => r.provider === 'aws').forEach((r) => {
      const safeLogicalId = r.name.replace(/[^a-zA-Z0-9]/g, '');
      if (r.type === 'ec2') {
        yaml += `  ${safeLogicalId}:
    Type: 'AWS::EC2::Instance'
    Properties:
      InstanceType: '${r.instanceType || 't3.medium'}'
      ImageId: 'ami-0c7217cdde317cfec'
      Tags:
        - Key: Name
          Value: '${r.name}'
`;
      } else if (r.type === 's3') {
        yaml += `  ${safeLogicalId}:
    Type: 'AWS::S3::Bucket'
    Properties:
      BucketName: '${r.name}'
`;
      }
    });
    return yaml;
  }

  public generatePulumi(resources: CloudResource[]): string {
    let ts = `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// AI CloudOps Automated Infrastructure as Code
`;
    resources.forEach((r) => {
      const safe = r.name.replace(/[^a-zA-Z0-9_]/g, '_');
      if (r.type === 'ec2') {
        ts += `
export const ${safe} = new aws.ec2.Instance("${r.name}", {
    instanceType: "${r.instanceType || 't3.medium'}",
    ami: "ami-0c7217cdde317cfec",
    tags: { Name: "${r.name}" },
});
`;
      }
    });
    return ts;
  }
}

export const globalIaCGenerator = new IaCGenerator();
