import Octokat from 'octokat';
import {staticFolder} from "@/main";
import Sass from 'sass.js'

export const dynamicFolder = 'dynamic';

const showdown = require('showdown');
const converter = new showdown.Converter({
    prefixHeaderId: '__markdown_header_id_',
    tables: true,
    tasklists: true,
    backslashEscapesHTMLTags: true,
    parseImgDimensions: true
});

// 直接从站点上获取文件text
export async function getText(path) {
    return new Promise(resolve => {
        fetch(path+'?ran='+new Date().getTime()).then(res => {
            res.text().then(res => {
                resolve([true, res])
            }).catch(err => {
                resolve([false, err])
            })
        }).catch(err => {
            resolve([false, err])
        })
    })
}

export function parseMarkdown(text) {
    text = text
        // target=_blank
        .replace(/(?<=^|[^\\])#\[(.*?)]\((.*?)\)/g, '<a target="_blank" href="$2">$1</a>')
        // sticker
        .replace(/(?<=^|[^\\])!\[sticker]\((aru|yellow-face)\/(\d+)\)/g, `<img alt="sticker" src="${staticFolder}/sticker/$1/$2.png"/>`)
        // dimension image
        .replace(/(?<=^|[^\\])!\[(.*?) x (.*?)]\((.*?)\)/g, (a, b, c, d) => {
            return `<img alt="dimension img" style="${b !== 'null' ? `width: ${b} !important;` : ''}${c !== 'null' ? `height: ${c} !important;` : ''}" src="${d}"/>`
        })
    return converter.makeHtml(text)
}

export function parseAjaxError(err) {
    if (err.response) {
        let status = err.response.status;
        switch (status) {
            case 401:
                return "错误: 未授权,请检查token是否正确";
            case 404:
                return "错误: 不存在那个文件";
            case 403:
                return "错误: 访问受限";
            default:
                return `错误码: ${status}`
        }
    }
    switch (err.message) {
        case "Network Error":
            return `网络错误: ${err}，请检查网络连接`;
        default:
            return `未知错误: ${err}`;
    }
}

export function stringToB64(s) {
    return btoa(unescape(encodeURIComponent(s)))
}

export function sortByTime(lis) {
    lis.sort((a, b) => {
        return a.time > b.time ? -1 : 1
    })
}

// github
export class GithubUtils {
    constructor(token, user, repo, committer) {
        this.octo = new Octokat({
            token: token,
            username: user,
        });
        this.repos = this.octo.repos(user, repo);
        this.committer = committer
    }

    async updateJsonFile(path, json) {
        path = `${dynamicFolder}/json/${path}`;
        return new Promise(resolve => {
            this.repos.contents(path).fetch().then(res => {
                return this.repos.contents(path).add({
                    message: `更新${path}`,
                    content: stringToB64(JSON.stringify(json, null, 4)),
                    sha: res.sha,
                    committer: this.committer
                }).then(res => {
                    resolve([true, res])
                }).catch(err => {
                    resolve([false, err])
                })
            }).catch(err => {
                resolve([false, err])
            })
        })
    }

    async updateMd(payload, dict) {
        return await this.createCommit([
            {
                folder: `${dynamicFolder}/md/${payload.folder}/index.md`,
                content: payload.md
            },
            {
                folder: `${dynamicFolder}/md/${payload.folder}/index.html`,
                content: payload.html
            }
        ], `更新 md-${payload.folder}`, dict)
    };

    async updateRecord(payload, dict) {
        return await this.createCommit([
            {
                folder: `${dynamicFolder}/record/${payload.file}.txt`,
                content: payload.txt
            }
        ], `更新 record-${payload.file}`, dict)
    };

    async updateTheme(scss, dict) {
        return new Promise(resolve => {
            Sass.compile(scss, async res => {
                resolve(await this.createCommit([
                    {
                        folder: `${dynamicFolder}/markdown.scss`,
                        content: scss
                    },
                    {
                        folder: `${dynamicFolder}/markdown.css`,
                        content: res.text
                    }
                ], `更新 theme`, dict))

            });
        })
    }

    // create commit
    async createCommit(files, message, dict) {
        return new Promise(async resolve => {
            dict.state = '获取master的SHA';
            let main = await this.repos.git.refs('heads/master').fetch().catch(err => {
                resolve([false, err])
            });

            // 创建tree
            let treeItems = [];
            for (let item of files) {
                dict.state = `创建blob:${item.folder.replace(/^.*\/([^/]*)$/, '$1')}`;
                let res = await this.repos.git.blobs.create({content: stringToB64(item.content), encoding: 'base64'}).catch(err => {
                    resolve([false, err])
                });
                treeItems.push({
                    path: item.folder,
                    sha: res.sha,
                    mode: "100644",
                    type: "blob"
                });
            }
            dict.state = '创建tree';
            let tree = await this.repos.git.trees.create({
                tree: treeItems,
                base_tree: main.object.sha
            }).catch(err => {
                resolve([false, err])
            });

            // commit
            dict.state = 'commit...';
            let commit = await this.repos.git.commits.create({
                message: message,
                tree: tree.sha,
                parents: [main.object.sha]
            }).catch(err => {
                resolve([false, err])
            });
            dict.state = 'update...';
            await main.update({sha: commit.sha}).catch(err => {
                resolve([false, err])
            });
            resolve([tree])
        })
    }

    async removeSome(folders, dic, what) {
        return new Promise(async resolve => {
            try {
                let repo = this.repos;
                dic.state = '获取 commit sha';
                // 先获取master的commit sha
                let res = await repo.git.refs('heads/master').fetch().catch(err => {
                    resolve([false, err])
                });
                dic.state = '获取 tree sha';
                // 根据commit sha获取tree sha
                res = await repo.git.commits(res.object.sha).fetch().catch(err => {
                    resolve([false, err])
                });
                // 根据tree sha递归获取sha
                const mdPath = [dynamicFolder, what];

                async function getMdSha(treeSha) {
                    if (mdPath.length) {
                        dic.state = `获取 ${mdPath[0]} sha`;
                        res = await repo.git.trees(treeSha).fetch().catch(err => {
                            resolve([false, err])
                        });
                        for (let t of res.tree) {
                            if (t.type === 'tree' && t.path === mdPath[0]) {
                                mdPath.splice(0, 1);
                                return await getMdSha(t.sha)
                            }
                        }
                    } else {
                        // 找到了
                        return await repo.git.trees(treeSha).fetch().catch(err => {
                            resolve([false, err])
                        });
                    }
                }

                res = await getMdSha(res.tree.sha);
                for (let i of res.tree) {
                    if (i.type === 'tree') {
                        if (folders.indexOf(i.path) !== -1) {
                            res = await repo.git.trees(i.sha).fetch().catch(err => {
                                resolve([false, err])
                            });
                            for (let j of res.tree) {
                                dic.state = `删除 ${i.path}-${j.path}`;
                                await repo.contents(`${dynamicFolder}/${what}/${i.path}/${j.path}`).remove({
                                    sha: j.sha,
                                    message: '删除'
                                }).catch(err => {
                                    resolve([false, err])
                                });
                            }
                        }
                    }else{
                        if (folders.indexOf(i.path.replace('.txt', '')) !== -1){
                            dic.state = `删除 ${i.path}`;
                            await repo.contents(`${dynamicFolder}/${what}/${i.path}`).remove({
                                sha: i.sha,
                                message: '删除'
                            }).catch(err => {
                                resolve([false, err])
                            });
                        }
                    }
                }
                resolve([true])
            } catch (err) {
                resolve([false, err])
            }
        })
    }
}