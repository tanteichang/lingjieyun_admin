import { defineStore } from 'pinia';

import { getCustomerList } from '@/api/enterprise/customer';
import {
  getCityTree,
  getEducation,
  getExperience,
  getInvoiceType,
  getJob,
  getProjectType,
  getSalary,
} from '@/api/enterprise/dict';
import type {
  CityTree,
  Education,
  Experience,
  InvoiceType,
  Job,
  ProjectType,
  Salary,
} from '@/api/model/enterprise/dict';

import { useUserStore } from '../user';

export const useDictStore = defineStore('_enterprise_dict', {
  state: () => ({
    customerType: [] as { id: number; name: string }[],
    projectType: [] as ProjectType[],
    invoiceType: [] as InvoiceType[],
    experience: [] as Experience[],
    salary: [] as Salary[],
    education: [] as Education[],
    job: [] as Job[],
    cityTree: [] as CityTree[],
  }),
  getters: {
    getCustomerTypeOptions(): { label: string; value: number }[] {
      return this.customerType.map((type) => ({
        label: type.name,
        value: type.id,
      }));
    },
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
    setCityTree(cityTree: CityTree[]) {
      this.cityTree = cityTree;
    },
    async fetchCustomerType() {
      const userStore = useUserStore();
      if (!userStore.token) {
        return;
      }
      const { data } = await getCustomerList({ page: 0, limit: 0 });
      this.customerType = [{ id: 0, name: userStore.enterpriseInfo.name }].concat(
        data.list.map((item) => ({ id: item.id, name: item.name })),
      );
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
    async fetchCityTree() {
      const { data } = await getCityTree();
      this.setCityTree(data);
    },
    getEducationLabel(id: number) {
      return this.education.find((item) => item.id === id)?.name || '-';
    },
    logout() {
      this.customerType = [];
      this.projectType = [];
      this.invoiceType = [];
      this.experience = [];
      this.salary = [];
      this.education = [];
      this.job = [];
      this.cityTree = [];
    },
  },
  persist: {
    storage: window.sessionStorage,
  },
});
