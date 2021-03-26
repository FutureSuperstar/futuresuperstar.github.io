**Class.forName和classloader的区别**



Class.forName(“className”) 该方法最终调用：Class.forName(className, true, ClassLoader.getCallerClassLoader())

- className：需要加载的类的名称
- true：是否对class进行初始化（需要initialize）
- classLoader：指定加载该类的类加载器



ClassLoader.loadClass(“className”)

该方法最终调用：ClassLoader.loadClass(name, false)

- name：类的全限定名
- false：加载这个类的时候是否需要进行连接操作（false，不需要）



> （1）class.forName()除了将类的.class文件加载到jvm中之外，还会对类进行解释，执行类中的static块。当然还可以指定是否执行静态块。
>
> （2）classLoader只干一件事情，就是将.class文件加载到jvm中，不会执行static中的内容,只有在newInstance才会去执行static块。

