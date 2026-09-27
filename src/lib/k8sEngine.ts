import { K8sPod, K8sNode } from './types';

export const initialK8sNodes: K8sNode[] = [
  {
    id: 'node-control-plane-01',
    name: 'ip-10-0-1-12.ec2.internal',
    role: 'control-plane',
    status: 'Ready',
    cpuCapacity: '8 vCPU (6.4 used)',
    memoryCapacity: '32 GB (24.1 GB used)',
    podsCount: 18,
    instanceType: 'c5.2xlarge',
  },
  {
    id: 'node-worker-02',
    name: 'ip-10-0-2-88.ec2.internal',
    role: 'worker',
    status: 'Ready',
    cpuCapacity: '16 vCPU (14.2 used)',
    memoryCapacity: '64 GB (52.6 GB used)',
    podsCount: 29,
    instanceType: 'm5.4xlarge',
  },
  {
    id: 'node-worker-03',
    name: 'ip-10-0-3-41.ec2.internal',
    role: 'worker',
    status: 'Ready',
    cpuCapacity: '16 vCPU (6.1 used)',
    memoryCapacity: '64 GB (18.4 GB used)',
    podsCount: 12,
    instanceType: 'm5.4xlarge',
  },
];

export const initialK8sPods: K8sPod[] = [
  {
    id: 'pod-api-gw-78f89-4kx2',
    name: 'api-gateway-78f89-4kx2',
    namespace: 'production',
    nodeName: 'ip-10-0-2-88.ec2.internal',
    status: 'Running',
    restarts: 0,
    cpuCurrentMilli: 850,
    cpuLimitMilli: 1000,
    memoryCurrentMb: 1420,
    memoryLimitMb: 2048,
    age: '4d 12h',
  },
  {
    id: 'pod-order-svc-6cd44-9mpx',
    name: 'order-service-6cd44-9mpx',
    namespace: 'production',
    nodeName: 'ip-10-0-2-88.ec2.internal',
    status: 'CrashLoopBackOff',
    restarts: 6,
    cpuCurrentMilli: 980,
    cpuLimitMilli: 1000,
    memoryCurrentMb: 1980,
    memoryLimitMb: 2048,
    age: '18m',
  },
  {
    id: 'pod-payment-proc-55b21-1plq',
    name: 'payment-processor-55b21-1plq',
    namespace: 'production',
    nodeName: 'ip-10-0-3-41.ec2.internal',
    status: 'Running',
    restarts: 1,
    cpuCurrentMilli: 320,
    cpuLimitMilli: 800,
    memoryCurrentMb: 640,
    memoryLimitMb: 1024,
    age: '12d 6h',
  },
  {
    id: 'pod-analytics-ingest-89ac-3kll',
    name: 'analytics-ingest-89ac-3kll',
    namespace: 'staging',
    nodeName: 'ip-10-0-3-41.ec2.internal',
    status: 'OOMKilled',
    restarts: 4,
    cpuCurrentMilli: 720,
    cpuLimitMilli: 1200,
    memoryCurrentMb: 2048,
    memoryLimitMb: 2048,
    age: '2h 10m',
  },
  {
    id: 'pod-ingress-nginx-controller-01',
    name: 'ingress-nginx-controller-01',
    namespace: 'kube-system',
    nodeName: 'ip-10-0-1-12.ec2.internal',
    status: 'Running',
    restarts: 0,
    cpuCurrentMilli: 210,
    cpuLimitMilli: 500,
    memoryCurrentMb: 410,
    memoryLimitMb: 1024,
    age: '30d',
  },
];

export class K8sEngine {
  private pods: K8sPod[] = [...initialK8sPods];
  private nodes: K8sNode[] = [...initialK8sNodes];

  public getPods(): K8sPod[] {
    return this.pods;
  }

  public getNodes(): K8sNode[] {
    return this.nodes;
  }

  public restartPod(id: string): { success: boolean; pod: K8sPod | null } {
    const pod = this.pods.find((p) => p.id === id);
    if (pod) {
      pod.status = 'Running';
      pod.restarts += 1;
      pod.cpuCurrentMilli = 320;
      pod.memoryCurrentMb = 580;
      pod.age = 'Just now';
      return { success: true, pod };
    }
    return { success: false, pod: null };
  }
}

export const globalK8sEngine = new K8sEngine();
