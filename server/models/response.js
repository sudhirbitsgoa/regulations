'use strict';
const mongo = require('mongodb');
const ObjectID = mongo.ObjectID;
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
		if (ctx.args && ctx.args.filter) {
			const where = ctx.args.filter.where;
			if (user.role === 'CSO') {
				where['userId'] = user.id;
			} else {
				where.assignedTo = user.id;
			}
		} else {
			ctx.args.filter = {
				where: {
					assignedTo: user.id
				}
			};
			if (user.role === 'CSO') {
				ctx.args.filter = {
					where: {
						userId: user.id
					}
				}
			}
		}
	});

	/**
	 * Assing Response to a user
	 * @param {string} functionGroup Select function group block
	 * @param {string} userId 
	 * @param {Function(Error, boolean)} callback
	 */

	Response.assign = async function (req, res, callback) {
		const body = req.body;
		const functionGroup = body.functionGroup;
		const userId = body.userId;
		const success = {
			success: true
		};
		let quest = await Response.app.models.Questions
			.find({
				where: {
					function: functionGroup
				}
			});

		const qIds = quest.map(q => q.question);
		await Response.dataSource.connector.db.collection('Response')
			.update({
				question: {
					$in: qIds
				}
			}, {
				$addToSet: {
					assignedTo: new ObjectID(userId)
				}
			}, {
				multi: true
			});
		// TODO
		return success;
		// callback(null, success);
	};

	Response.score = async function (req, res, callback) {
		const ResponseModel = Response.dataSource.connector.db.collection('Response');
		const aggregation = [
			{
				'$match': {
					'answer': {
						'$exists': 1
					}
				}
			}, {
				'$group': {
					'_id': '$answer',
					'total': {
						'$sum': 1
					}
				}
			}
		];
		const resp = await ResponseModel.aggregate(aggregation);
		const respo = await resp.toArray();
		return respo;
	}
};
