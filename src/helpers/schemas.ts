import { object, ref, string } from 'yup'

export const LoginSchema = object().shape({
  email: string().email('无效的邮箱地址').required('邮箱是必填项'),
  password: string().min(6, '密码至少6个字符').required('密码是必填项'),
})

export const RegisterSchema = object().shape({
  name: string().required('姓名是必填项'),
  email: string().email('无效的邮箱地址').required('邮箱是必填项'),
  password: string().min(6, '密码至少6个字符').required('密码是必填项'),
  confirmPassword: string()
    .oneOf([ref('password')], '密码不匹配')
    .required('确认密码是必填项'),
})
