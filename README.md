#Yingzheng（嬴政）

##Overview
Yingzheng is a Node.js program that tracks the modifying of files with designated extensions. It will pass the changed files' names to a customized script(plugin).

It is named after the first emperor of ancient China, the great Yingzheng. Because I couldn't find an appropriate name of this project, I decided to use emperors' names to name my future projects.

##Usage
Yingzheng.js is written with Continuation.js. In each release I will also provide a compiled version so that you don't have to install Continuation.js.

---

You should provide ``.yingzheng.control`` file, a example of which is presented here:

```
*.m4v
*.m4a
*.png
*.jpg
```

It should list the extensions of files that Yingzheng.js will track. No comments.

The future version will include a more complicated yet powerful ``.yingzheng.control`` file. I hope one day you could work it with Git.

---

The javascript plugin should be named as ``.yingzheng.plugin.js`` and have an interface ``entry (files)``. ``files`` is an array consisting of each file's relative path.

---

You can run the program with the following command.

```
node path-to-yingzheng.js/yingzheng.js work-path

```

The work path should not have a directory called ``.yingzheng``, which is used to store track information.