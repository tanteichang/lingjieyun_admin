export const validator = {
  mobile: {
    message: '请输入正确的手机号',
    validator: (val: string) => /^1[3-9]\d{9}$/.test(val),
  },
  password: {
    message: '请输入密码（8-15位，包含字母和数字）',
    validator: (val: string) => /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,15}$/i.test(val),
  },
};
