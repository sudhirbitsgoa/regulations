'use strict';

module.exports = function(Regulationsquestionsmapping) {
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
	Regulationsquestionsmapping.beforeRemote('find', async (ctx) => {
		const user = await resolveUser(ctx);
		if (user.filter) {
			ctx.args.filter = user.filter;
		}
		return
	});
	Regulationsquestionsmapping.afterRemote('find', async (ctx, output) => {
		const user = await resolveUser(ctx);
		if (user.filter) {
			ctx.req.query.filter = user.filter;
		}
		if (!ctx.result) {
			return;
		}
		let filter = [];
		if (ctx.req.query.filter) {
			try {
				filter = ctx.req.query.filter;
				if (!user.filter) {
					filter = JSON.parse(ctx.req.query.filter);
				}
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
					const e = quest[j];
					questions.push(e.toJSON());
				}
				regulation.questions = questions;
				regulJson.questions = questions;
				delete regulation.questionsMapping;
			} catch (error) {
				console.log('the regulation parse failed');
			}
			if (!user.filter) {
				delete regulJson.id;
				regulJson.userId = user.id;
				await Regulationsquestionsmapping.app.models.Response.create(regulJson);
			}
		}
		if (!user.filter) {
			user.filter = JSON.parse(ctx.req.query.filter);
			await user.save()
		}
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
