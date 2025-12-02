const PR_MARKER = '<!-- action-pr-marker -->';

async function findComment({ github, context, core }) {
  const comments = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number
  });
  const existingComment = comments.data.find((comment) =>
    comment.body.includes(PR_MARKER)
  );

  return existingComment?.id;
}

async function setComment({ github, context, commentId, body }) {
  if (commentId) {
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: commentId,
      body
    });
  } else {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      body
    });
  }
}

async function createDeployingComment({ github, context, core }) {
  const commentId = await findComment({ github, context, core });

  const comment = `
${PR_MARKER}
### <span aria-hidden="true">⚙️</span> Website deploying to S3!

|  Name | Link |
|:-:|------------------------|
|<span aria-hidden="true">🔨</span> Latest commit | ${context.payload.pull_request.head.sha} |
`;

  await setComment({ github, context, commentId, body: comment });
}

async function createFailedComment({ github, context, core }) {
  const commentId = await findComment({ github, context, core });

  const comment = `
${PR_MARKER}
### <span aria-hidden="true">❌</span> Deployment failed!

_Check the action logs for more information._

|  Name | Link |
|:-:|------------------------|
|<span aria-hidden="true">🔨</span> Latest commit | ${context.payload.pull_request.head.sha} |
`;

  await setComment({ github, context, commentId, body: comment });
}

async function createSuccessComment({ github, context, core }) {
  const commentId = await findComment({ github, context, core });

  const websiteUrl = `http://${process.env.BUCKET_NAME}.s3-website-${process.env.AWS_REGION}.amazonaws.com/`;
  const comment = `
${PR_MARKER}
### <span aria-hidden="true">✅</span> Deploy Preview ready!


|  Name | Link |
|:-:|------------------------|
|<span aria-hidden="true">🔨</span> Latest commit | ${context.payload.pull_request.head.sha} |
|<span aria-hidden="true">😎</span> Deploy Preview | ${websiteUrl} |
`;

  await setComment({ github, context, commentId, body: comment });
}

async function deleteComment({ github, context, core }) {
  const commentId = await findComment({ github, context, core });

  if (commentId) {
    await github.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: commentId
    });
  }
}

module.exports = {
  createDeployingComment,
  createFailedComment,
  createSuccessComment,
  deleteComment
};
