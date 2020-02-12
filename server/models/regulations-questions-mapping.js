'use strict';

module.exports = function (Regulationsquestionsmapping) {
	// need to extend array of functions
	// should persist questions id
	// can share questions to other user

	async function resolveUser(ctx) {
		const req = ctx.req;
		const token = req.headers["access_token"] || req.query.access_token;
		const AccessToken = Regulationsquestionsmapping.app.models.AccessToken;
		const UserModel = Regulationsquestionsmapping.app.models.User;
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

	Regulationsquestionsmapping.afterRemote('find', async (ctx, output) => {
		const user = await resolveUser(ctx);
		if (!ctx.result) {
			return;
		}
		let filter = [];
		if (ctx.req.query.filter) {
			try {
				filter = JSON.parse(ctx.req.query.filter);
			} catch (error) {
				console.log(error);
			}
		}
		for (let i = 0; i < ctx.result.length; i++) {
			const regulation = ctx.result[i];
			const regulJson = ctx.result[i].toJSON();
			let quest = await Regulationsquestionsmapping.app.models.Questions
				.find({
					where: {
						question: {
							inq: regulation.questionsMapping
						},
						function: {
							inq: filter.func
						}
					}
				});
			if (!quest) {
				continue;
			}
			try {
				let questions = []
				for (let j = 0; j < quest.length; j++) {
					const e = quest[j].toJSON();
					questions.push(e);
					const storeQuest = await Regulationsquestionsmapping.app.models.Response.findOne({
						where: {
							userId: user.id,
							question: e.question
						}
					});
					if (storeQuest) {
						continue;
					}
					await Regulationsquestionsmapping.app.models.Response.create({
						userId: user.id,
						question: e.question,
						questionDetails: e
					});
					
				}
				const query = {
					where: {
						userId: user.id,
						regulation:  regulation.regulation
					}
				};
				const storeReg = await Regulationsquestionsmapping
					.app.models.RegulationsUser.findOne(query);
				if (!storeReg) {
					const obj = {
						userId: user.id,
						createdAt: Date.now(),
						regulation: regulJson.regulation.toString(),
						functions: filter.func
					};
					await Regulationsquestionsmapping.app.models.RegulationsUser.create(obj);
				}
				regulation.questions = questions;
				regulJson.questions = questions;
				delete regulation.questionsMapping;
			} catch (error) {
				console.log('the regulation parse failed', error);
			}
			delete regulJson.id;
			regulJson.userId = user.id;
		}
		if (filter.where && filter.where.regulation && filter.where.regulation.inq.length > 0) {
			try {
				const RgUsers = await Regulationsquestionsmapping.app.models.RegulationsUser.find({
					where: {
						userId: user.id,
						"regulation": {
							nin: filter.where.regulation.inq
						}
					}
				});
				for (let j = 0; j < RgUsers.length; j++) {
					const RgUser = RgUsers[j];
					RgUser.archived = true;
					RgUser.archivedAt = Date.now();
					await RgUser.save();
				}
			} catch (error) {
				debugger;
			}
		}
		// if (!user.filter) {
		// 	user.filter = JSON.parse(ctx.req.query.filter);
		// 	await user.save()
		// }
		return;
	});
	Regulationsquestionsmapping.afterRemote('findById', async (ctx, output) => {
		if (!ctx.result) {
			return;
		}
		const regulation = ctx.result[i];
		let quest = await Regulationsquestionsmapping.app.models.Questions
			.find({
				where: {
					questionsMapping: {
						$in: regulation.questionsMapping
					}
				}
			});

		try {
			regulation.questions = quest;
			delete regulation.questionsMapping;
		} catch (error) {
			console.log('the regulation parse failed');
		}
		return;
	});
};
