'use strict';

module.exports = function (Response) {
	async function resolveUser(ctx) {
		const req = ctx.req;
		const token = req.headers["access_token"] || req.query.access_token;
		const AccessToken = Response.app.models.AccessToken;
		const UserModel = Response.app.models.User;
		const details = await AccessToken.findOne({
			where: {
				id: token
			}
		});
		const user = await UserModel.findOne({
			where: {
				id: details.userId.toString()
			}
		});
		return user;
	}

	Response.beforeRemote('find', async (ctx, output) => {
		const user = await resolveUser(ctx);
		if (!ctx.result) {
			return;
		}
		if (ctx.args && ctx.args.filter) {
			const where = ctx.args.filter.where;
			where['userId'] = user.id;
		} else {
			ctx.args.filter = {
				where : {
					userId: user.id
				}
			};
		}
	});
};
