'use client'

import { Button, Input } from '@nextui-org/react'
import { Formik } from 'formik'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoginSchema } from '~/helpers/schemas'
import { AuthLayoutWrapper } from './authLayout'

export const Login = () => {
  const router = useRouter()

  const initialValues = {
    email: '',
    password: '',
  }

  const handleLogin = async (values: typeof initialValues) => {
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        console.error('登录错误:', result.error)
      } else {
        router.push('/admin') // 重定向到所需页面
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('登录错误:', error.message) // 安全访问 error.message
      } else {
        console.error('登录错误: 发生未知错误')
      }
    }
  }

  return (
    <AuthLayoutWrapper>
      <div className="mb-6 text-center text-[25px] font-bold">Login</div>

      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <>
            <div className="mb-4 flex w-1/2 flex-col gap-4">
              <Input
                variant="bordered"
                label="Email"
                type="email"
                value={values.email}
                isInvalid={!!errors.email && !!touched.email}
                errorMessage={errors.email}
                onChange={handleChange('email')}
              />
              <Input
                variant="bordered"
                label="Password"
                type="password"
                value={values.password}
                isInvalid={!!errors.password && !!touched.password}
                errorMessage={errors.password}
                onChange={handleChange('password')}
              />
            </div>

            <Button
              onPress={() => handleSubmit()}
              variant="flat"
              color="primary"
            >
              登录
            </Button>
          </>
        )}
      </Formik>

      <div className="mt-4 text-sm font-light text-slate-400">
        没有帐户？{' '}
        <Link href="/admin/register" className="font-bold">
          在此注册
        </Link>
      </div>
    </AuthLayoutWrapper>
  )
}
