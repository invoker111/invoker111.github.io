import axios from 'axios';
import siteConfig from '@/site-config';
import {parseAjaxError} from "@/utils";

let owner = siteConfig.owner,
    //  owner = 'vuejs',
    //  repo = `vue`,
    repo = `${owner}.github.io`,
    repoId = '',
    // this token just can read public information
    publicToken = 'token ' + (['5', '66b4e73893d07b79dbcc3e36f86acc309e78b2d'].join('')),
    headers = {
        Authorization: publicToken
    },
    http = function (payload) {
        return new Promise(resolve => {
            axios({
                url: 'https://api.github.com/graphql',
                method: 'post',
                ...payload,
                headers: {
                    ...(payload.headers || {}),
                    ...headers
                }
            }).then(res => {
                resolve([true, res])
            }).catch(err => {
                resolve([false, err])
            })
        })
    };

export const logError = function (res, suc, err) {
    if (res[0]) {
        if (res[1].data.errors) {
            this.$message.error(`${err} ${res[1].data.errors[0].message}`)
            return false
        } else {
            this.$message.success(suc);
            return true
        }
    } else {
        this.$message.error(`${err} ${parseAjaxError(res[1])}`)
        return false
    }
}

// ======================== methods ============================

export async function getRepoId() {
    let res = await http({
        data: {
            query:
                `query {
  repository(name: "${repo}", owner: "${owner}") {
    id
  }
}
`
        }
    });
    if (res[0]) {
        repoId = res[1].data.data.repository.id;
    }
}

export async function getLoginInfo(token) {
    headers.Authorization = `token ${token}`;
    let res = await http({
        data: {
            query:
                `query {
    viewer {
        login,
        avatarUrl,
        url
    }
}`
        }
    })
    if (!res[0]) {
        headers.Authorization = publicToken;
    }
    return res;
}

export function removeToken() {
    headers.Authorization = ''
}

export async function getPageComment(payload) {
    return await http({
        data: {
            query:
                `{
  search(query: "${payload.title}+in:title repo:${owner}/${repo} is:open", type: ISSUE, ${(payload.cursor && payload.cursor.indexOf(',after') === 0) || !payload.cursor ? 'first' : 'last'}: ${payload.count}${payload.cursor || ''}) {
    issueCount
    nodes {
      ... on Issue {
        author {
          avatarUrl
          login
          url
        }
        body
        number
        createdAt
        id
        authorAssociation
        reactions(first: 0, content: THUMBS_UP) {
          totalCount
        }
        comments(first: ${payload.count}) {
          totalCount
          nodes {
            author {
              avatarUrl
              login
              url
            }
            authorAssociation
            body
            createdAt
            id
            reactions(first: 0, content: THUMBS_UP) {
              totalCount
            }
          }
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
        }
      }
    }
    pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
    }
  }
}`
        }
    })
}

export async function getCommentChildren(id, count, cursor) {
    return await http({
        data: {
            query:
                `query {
  node(id: "${id}") {
    ... on Issue {
        comments(${(cursor && cursor.indexOf(',after') === 0) || !cursor ? 'first' : 'last'}: ${count}${cursor || ''}) {
          totalCount
          nodes {
            author {
              avatarUrl
              login
              url
            }
            authorAssociation
            body
            createdAt
            id
            reactions(first: 0, content: THUMBS_UP) {
              totalCount
            }
          }
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
        }
    }
  }
}
`
        }
    })
}

export async function createComment(payload) {
    return await http({
        data: {
            query:
                `mutation {
  createIssue(input: {repositoryId: "${repoId}", title: "${payload.title}", body: "${payload.body}"}) {
    issue {
      id
    }
  }
}`
        }
    })
}

export async function close_deleteComment(type, id) {
    return await http({
        data: {
            query:
                `mutation {
  ${type}Issue(input: {issueId: "${id}"}) {
    clientMutationId
  }
}
`
        }
    })
}

export async function createReply(payload) {
    return await http({
        data: {
            query:
                `mutation {
  addComment(input: {body: "${payload.body}", subjectId: "${payload.id}"}) {
    clientMutationId
  }
}
`
        }
    })
}

export async function deleteReply(id) {
    return await http({
        data: {
            query:
                `mutation {
  deleteIssueComment(input: {id: "${id}"}) {
    clientMutationId
  }
}
`
        }
    })
}