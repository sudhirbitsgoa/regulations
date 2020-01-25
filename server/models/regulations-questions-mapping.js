'use strict';

module.exports = function(Regulationsquestionsmapping) {
	Regulationsquestionsmapping.afterRemote('find', async (ctx, output) => {
		if (!ctx.result) {
			return;
		}
		for (let i = 0; i < ctx.result.length; i++) {
			const regulation = ctx.result[i];
			let quest = await Regulationsquestionsmapping.app.models.Questions
			.find({
				questionsMapping: {
					$in: regulation.questionsMapping
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
			questionsMapping: {
				$in: regulation.questionsMapping
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
