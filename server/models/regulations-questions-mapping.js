'use strict';

module.exports = function(Regulationsquestionsmapping) {
	// need to extend array of functions
	// should persist questions id
	// can share questions to other user
	Regulationsquestionsmapping.afterRemote('find', async (ctx, output) => {
		if (!ctx.result) {
			return;
		}
		let filter;
		if (ctx.req.query.filter) {
			try {
				filter = JSON.parse(ctx.req.query.filter);
			} catch (error) {
				console.log(error);				
			}
		}
		for (let i = 0; i < ctx.result.length; i++) {
			const regulation = ctx.result[i];
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
				regulation.questions = quest;
				delete regulation.questionsMapping;
			} catch (error) {
				console.log('the regulation parse failed');
			}
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
