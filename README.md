![Build Status](https://gitlab.devsep.com/tuan_da/pockerplanning/badges/master/pipeline.svg)

---

The project was deployed to [https://tuan_da.pages.devsep.com/pockerplanning](https://tuan_da.pages.devsep.com/pockerplanning)

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Technologies](#technologies)
- [GitLab User or Group Pages](#gitlab-user-or-group-pages)
- [Did you fork this project?](#did-you-fork-this-project)
- [Troubleshooting](#troubleshooting)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
c
## Technologies

- TailwindCSS 3 (https://tailwindcss.com/)
- VueJS 3 (https://vuejs.org)
- Bundle parcel (https://parceljs.org)
- Websocket via Pusher (https://pusher.com)
- Pusher Auth channels deployed on Heroku (https://github.com/pusher/pusher-channels-auth-example)

> This project was created with minimum tech stack. The early version, It's only contains HTML with a script
link to Vue & TailwindCSS on CDN. No bundle, no node_modules, no Single File Components (SFC)


## Development

```
node --version
# v17.2.0
npm --version
# 8.1.4
npm install
npm run start

# To build code & deploy
npm run build
```

## Gitlab CI

This project's static Pages are built by [GitLab CI][ci], following the steps
defined in [`.gitlab-ci.yml`](.gitlab-ci.yml):

```
image: alpine:latest

pages:
  stage: deploy
  script:
  - echo 'Nothing to do...'
  artifacts:
    paths:
    - public
  only:
  - master
```

The above example expects to put all your HTML files in the `public/` directory.

## GitLab User or Group Pages

To use this project as your user/group website, you will need one additional
step: just rename your project to `namespace.gitlab.io`, where `namespace` is
your `username` or `groupname`. This can be done by navigating to your
project's **Settings**.

Read more about [user/group Pages][userpages] and [project Pages][projpages].

## Did you fork this project?

If you forked this project for your own use, please go to your project's
**Settings** and remove the forking relationship, which won't be necessary
unless you want to contribute back to the upstream project.

## Troubleshooting

1. CSS is missing! That means that you have wrongly set up the CSS URL in your
   HTML files. Have a look at the [index.html] for an example.

[ci]: https://about.gitlab.com/gitlab-ci/
[index.html]: https://gitlab.com/pages/plain-html/blob/master/public/index.html
[userpages]: https://docs.gitlab.com/ce/user/project/pages/introduction.html#user-or-group-pages
[projpages]: https://docs.gitlab.com/ce/user/project/pages/introduction.html#project-pages
