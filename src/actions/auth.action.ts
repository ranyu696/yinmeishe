'use server' // 使用服务器端模式

import { cookies } from 'next/headers' // 从 next/headers 导入 cookies 模块

// 创建一个名为 createAuthCookie 的异步函数，用于设置用户认证的 cookie
export const createAuthCookie = async () => {
  // 设置名为 "userAuth" 的 cookie，值为 "myToken"，并且设置 secure 属性为 true
  cookies().set('userAuth', 'myToken', { secure: true })
}

// 创建一个名为 deleteAuthCookie 的异步函数，用于删除用户认证的 cookie
export const deleteAuthCookie = async () => {
  // 删除名为 "userAuth" 的 cookie
  cookies().delete('userAuth')
}
