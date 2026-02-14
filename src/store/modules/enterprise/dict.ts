import { defineStore } from 'pinia';

import { getEducation, getExperience, getInvoiceType, getJob, getProjectType, getSalary } from '@/api/dict';
import type { Education, Experience, InvoiceType, Job, ProjectType, Salary } from '@/api/model/dict';

export const useDictStore = defineStore('_enterprise_dict', {
  state: () => ({
    projectType: [] as ProjectType[],
    invoiceType: [] as InvoiceType[],
    experience: [] as Experience[],
    salary: [] as Salary[],
    education: [] as Education[],
    job: [] as Job[],
  }),
  getters: {
    getProjectTypeOptions(): { label: string; value: number }[] {
      return this.projectType.map((type) => ({
        label: type.name,
        value: type.id,
      }));
    },
    getInvoiceTypeOptions(): {
      label: string;
      value: number;
      children?: { label: string; value: number; children?: any[] }[];
    }[] {
      // 递归处理树结构
      const processTree = (
        nodes: InvoiceType[],
      ): { label: string; value: number; children?: { label: string; value: number; children?: any[] }[] }[] => {
        return nodes.map((node) => {
          const option: {
            label: string;
            value: number;
            children?: { label: string; value: number; children?: any[] }[];
          } = {
            label: node.name,
            value: node.id,
          };

          // 处理子节点
          if (node.children && node.children.length > 0) {
            option.children = processTree(node.children);
          }
          return option;
        });
      };

      return processTree(this.invoiceType);
    },
    getExperienceOptions(): { label: string; value: number }[] {
      return this.experience.map((exp) => ({
        label: exp.label,
        value: exp.id,
      }));
    },
    getSalaryOptions(): { label: string; value: number }[] {
      return this.salary.map((sal) => ({
        label: sal.label,
        value: sal.id,
      }));
    },
    getEducationOptions(): { label: string; value: number }[] {
      return this.education.map((edu) => ({
        label: edu.name,
        value: edu.id,
      }));
    },
    getJobOptions(): {
      label: string;
      value: number;
      children?: { label: string; value: number; children?: any[] }[];
    }[] {
      // 递归处理树结构
      const processTree = (
        nodes: Job[],
      ): { label: string; value: number; children?: { label: string; value: number; children?: any[] }[] }[] => {
        return nodes.map((node) => {
          const option: {
            label: string;
            value: number;
            children?: { label: string; value: number; children?: any[] }[];
          } = {
            label: node.name,
            value: node.id,
          };

          // 处理子节点
          if (node.children && node.children.length > 0) {
            option.children = processTree(node.children);
          }
          return option;
        });
      };

      return processTree(this.job);
    },
  },
  actions: {
    setProjectType(projectType: ProjectType[]) {
      this.projectType = projectType;
    },
    setInvoiceType(invoiceType: InvoiceType[]) {
      this.invoiceType = invoiceType;
    },
    setExperience(experience: Experience[]) {
      this.experience = experience;
    },
    setSalary(salary: Salary[]) {
      this.salary = salary;
    },
    setEducation(education: Education[]) {
      this.education = education;
    },
    setJob(job: Job[]) {
      this.job = job;
    },
    async fetchProjectType() {
      const { data } = await getProjectType();
      this.setProjectType(data);
    },
    async fetchInvoiceType() {
      const { data } = await getInvoiceType();
      this.setInvoiceType(data);
    },
    async fetchExperience() {
      const { data } = await getExperience();
      this.setExperience(data);
    },
    async fetchSalary() {
      const { data } = await getSalary();
      this.setSalary(data);
    },
    async fetchEducation() {
      const { data } = await getEducation();
      this.setEducation(data);
    },
    async fetchJob() {
      const { data } = await getJob();
      this.setJob(data);
    },
  },
  persist: false,
});
