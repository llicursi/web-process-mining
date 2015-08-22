function addClass(elemento, classe) {
	if (elemento != null && elemento.className.indexOf(classe) < 0) {
		elemento.className = elemento.className + " " + classe;
	}
}

function remClass(elemento, classe) {
	if (elemento != null) {
		var index = elemento.className.indexOf(classe);
		if (index >= 0) {
			var classes = elemento.className.split(classe);
			if (classes.length > 0) {
				elemento.className = classes[0];
			}
			if (classes.length == 2) {
				elemento.className = elemento.className + " " + classes[1];
			}
		}
	}
}

/**
 * getNextSibling Recupera o proximo elemento do mesmo tipo que o elemento
 * (node) ou do tipo especificado (tag)
 */
function getNextSibling(node, tag) {
	if (!tag)
		tag = node.nodeName;
	tag = tag.toUpperCase();
	var cont = 20; // Limita o numero de itera��es para evitar sobrecarga no ie
	while (node.nextSibling && node.nextSibling.nodeName
			&& node.nextSibling.nodeName.toUpperCase() != tag && cont-- > 0) {
		node = node.nextSibling;
	}
	return node.nextSibling;
}

/**
 * getPreviousSibling Recupera o proximo elemento do mesmo tipo que o elemento
 * (node) ou do tipo especificado (tag)
 */
function getPreviousSibling(node, tag) {
	if (!tag)
		tag = node.nodeName;
	var cont = 20; // Limita o numero de itera��es para evitar sobrecarga no ie
	while (node.previousSibling && node.previousSibling.nodeName != tag
			&& cont-- > 0) {
		node = node.previousSibling;
	}
	return node.previousSibling;
}

var a = {
	"_id" : {
		"$oid" : "55d51a6ed57d352ff64db92d"
	},
	"_class" : "br.com.licursi.core.process.ProcessMongoEntity",
	"uuid" : "5d9ab8d7-f2d7-46e1-bdea-4b080958233f",
	"arcs" : {
		"H>02" : {
			"ref" : "H>02",
			"source" : "PAY COMPENSATION",
			"target" : "END2",
			"count" : 0,
			"dependencyMeasure" : 0.0,
			"sumTime" : 314311404
		},
		"B>D" : {
			"ref" : "B>D",
			"source" : "CHECK TICKET",
			"target" : "DECIDE",
			"count" : 66,
			"dependencyMeasure" : 0.9850746393203735,
			"sumTime" : 24200220000
		},
		"D>H" : {
			"ref" : "D>H",
			"source" : "DECIDE",
			"target" : "PAY COMPENSATION",
			"count" : 33,
			"dependencyMeasure" : 0.970588207244873,
			"sumTime" : 16967280000
		},
		"A>B" : {
			"ref" : "A>B",
			"source" : "REGISTER REQUEST",
			"target" : "CHECK TICKET",
			"count" : 22,
			"dependencyMeasure" : 0.95652174949646,
			"sumTime" : 40425000000
		},
		"A>C" : {
			"ref" : "A>C",
			"source" : "REGISTER REQUEST",
			"target" : "EXAMINE THOROUGHLY",
			"count" : 11,
			"dependencyMeasure" : 0.9166666865348816,
			"sumTime" : 9397740000
		},
		"D>G" : {
			"ref" : "D>G",
			"source" : "DECIDE",
			"target" : "REINITIATE REQUEST",
			"count" : 33,
			"dependencyMeasure" : 0.970588207244873,
			"sumTime" : 2191200000
		},
		"D>E" : {
			"ref" : "D>E",
			"source" : "DECIDE",
			"target" : "REJECT REQUEST",
			"count" : 33,
			"dependencyMeasure" : 0.970588207244873,
			"sumTime" : 5089920000
		},
		"E>01" : {
			"ref" : "E>01",
			"source" : "REJECT REQUEST",
			"target" : "END1",
			"count" : 0,
			"dependencyMeasure" : 0.0,
			"sumTime" : 314311404
		},
		"F>D" : {
			"ref" : "F>D",
			"source" : "EXAMINE CASUALLY",
			"target" : "DECIDE",
			"count" : 22,
			"dependencyMeasure" : 0.95652174949646,
			"sumTime" : 30002940000
		},
		"C>D" : {
			"ref" : "C>D",
			"source" : "EXAMINE THOROUGHLY",
			"target" : "DECIDE",
			"count" : 11,
			"dependencyMeasure" : 0.9166666865348816,
			"sumTime" : 9319200000
		},
		"A>F" : {
			"ref" : "A>F",
			"source" : "REGISTER REQUEST",
			"target" : "EXAMINE CASUALLY",
			"count" : 33,
			"dependencyMeasure" : 0.970588207244873,
			"sumTime" : 25204080000
		},
		"00>A" : {
			"ref" : "00>A",
			"source" : "START0",
			"target" : "REGISTER REQUEST",
			"count" : 0,
			"dependencyMeasure" : 0.0,
			"sumTime" : 638147396
		},
		"G>B" : {
			"ref" : "G>B",
			"source" : "REINITIATE REQUEST",
			"target" : "CHECK TICKET",
			"count" : 11,
			"dependencyMeasure" : 0.9166666865348816,
			"sumTime" : 5561160000
		},
		"G>C" : {
			"ref" : "G>C",
			"source" : "REINITIATE REQUEST",
			"target" : "EXAMINE THOROUGHLY",
			"count" : 11,
			"dependencyMeasure" : 0.9166666865348816,
			"sumTime" : 31680000
		},
		"G>F" : {
			"ref" : "G>F",
			"source" : "REINITIATE REQUEST",
			"target" : "EXAMINE CASUALLY",
			"count" : 11,
			"dependencyMeasure" : 0.9166666865348816,
			"sumTime" : 5537400000
		}
	},
	"activities" : {
		"PAY COMPENSATION" : {
			"name" : "PAY COMPENSATION",
			"uniqueLetter" : "H",
			"count" : 66,
			"previous" : [ "DECIDE" ],
			"next" : [ "END2" ],
			"resources" : {
				"Ellen" : [ 521400000, 261780000, 261780000, 261780000,
						521400000, 521400000, 261780000, 261780000, 521400000,
						521400000, 521400000, 261780000, 521400000, 521400000,
						261780000, 521400000, 261780000, 261780000, 261780000,
						521400000, 261780000, 521400000 ],
				"Mike" : [ 759300000, 759300000, 759300000, 759300000,
						759300000, 759300000, 759300000, 759300000, 759300000,
						759300000, 759300000 ]
			},
			"avgTime" : 514160000,
			"index" : 8,
			"type" : "END"
		},
		"EXAMINE CASUALLY" : {
			"name" : "EXAMINE CASUALLY",
			"uniqueLetter" : "F",
			"count" : 154,
			"previous" : [ "REINITIATE REQUEST", "REGISTER REQUEST" ],
			"next" : [ "DECIDE" ],
			"resources" : {
				"Ellen" : [ 3840000, 3840000, 3840000, 3840000, 3840000,
						3840000, 3840000, 3840000, 3840000, 3840000, 3840000 ],
				"Sue" : [ 1296240000, 73080000, 1296240000, 73080000,
						1296240000, 73080000, 1296240000, 73080000, 1296240000,
						73080000, 1296240000, 73080000, 1296240000, 73080000,
						1296240000, 73080000, 1296240000, 73080000, 1296240000,
						73080000, 1296240000, 73080000 ],
				"Mike" : [ 2040000, 90840000, 888480000, 430320000, 2040000,
						90840000, 888480000, 430320000, 90840000, 888480000,
						430320000, 2040000, 2040000, 2040000, 90840000,
						888480000, 430320000, 90840000, 888480000, 430320000,
						90840000, 888480000, 430320000, 90840000, 888480000,
						430320000, 2040000, 90840000, 888480000, 430320000,
						2040000, 2040000, 90840000, 888480000, 430320000,
						2040000, 2040000, 90840000, 888480000, 430320000,
						2040000, 90840000, 888480000, 430320000 ],
				"Sean" : [ 9840000, 9840000, 9840000, 9840000, 9840000,
						9840000, 9840000, 9840000, 9840000, 9840000, 9840000 ]
			},
			"avgTime" : 349335000,
			"index" : 6,
			"type" : "NORMAL"
		},
		"CHECK TICKET" : {
			"name" : "CHECK TICKET",
			"uniqueLetter" : "B",
			"count" : 231,
			"previous" : [ "REINITIATE REQUEST", "REGISTER REQUEST" ],
			"next" : [ "DECIDE" ],
			"resources" : {
				"Pete" : [ 767460000, 170700000, 181200000, 1305120000,
						81960000, 767460000, 170700000, 181200000, 1305120000,
						81960000, 181200000, 1305120000, 81960000, 767460000,
						170700000, 767460000, 170700000, 767460000, 170700000,
						181200000, 1305120000, 81960000, 181200000, 1305120000,
						81960000, 181200000, 1305120000, 81960000, 181200000,
						1305120000, 81960000, 767460000, 170700000, 181200000,
						1305120000, 81960000, 767460000, 170700000, 767460000,
						170700000, 181200000, 1305120000, 81960000, 767460000,
						170700000, 767460000, 170700000, 181200000, 1305120000,
						81960000, 767460000, 170700000, 181200000, 1305120000,
						81960000 ],
				"Ellen" : [ 7320000, 711060000, 252900000, 7320000, 711060000,
						252900000, 711060000, 252900000, 7320000, 7320000,
						7320000, 711060000, 252900000, 711060000, 252900000,
						711060000, 252900000, 711060000, 252900000, 7320000,
						711060000, 252900000, 7320000, 7320000, 711060000,
						252900000, 7320000, 7320000, 711060000, 252900000,
						7320000, 711060000, 252900000 ],
				"Mike" : [ 75840000, 533400000, 2400000, 91200000, 2400000,
						75840000, 2400000, 91200000, 533400000, 75840000,
						75840000, 2400000, 533400000, 91200000, 533400000,
						91200000, 533400000, 91200000, 533400000, 2400000,
						75840000, 75840000, 91200000, 91200000, 91200000,
						75840000, 533400000, 2400000, 75840000, 75840000,
						2400000, 91200000, 2400000, 533400000, 533400000,
						2400000, 91200000, 2400000, 75840000, 2400000,
						533400000, 75840000, 91200000, 533400000 ]
			},
			"avgTime" : 348380000,
			"index" : 2,
			"type" : "NORMAL"
		},
		"REINITIATE REQUEST" : {
			"name" : "REINITIATE REQUEST",
			"uniqueLetter" : "G",
			"count" : 66,
			"previous" : [ "DECIDE" ],
			"next" : [ "EXAMINE CASUALLY", "CHECK TICKET", "EXAMINE THOROUGHLY" ],
			"resources" : {
				"Sara" : [ 10800000, 96600000, 91800000, 10800000, 96600000,
						91800000, 96600000, 91800000, 10800000, 10800000,
						10800000, 96600000, 91800000, 96600000, 91800000,
						96600000, 91800000, 96600000, 91800000, 10800000,
						96600000, 91800000, 10800000, 10800000, 96600000,
						91800000, 10800000, 10800000, 96600000, 91800000,
						10800000, 96600000, 91800000 ]
			},
			"avgTime" : 66400000,
			"index" : 7,
			"type" : "NORMAL"
		},
		"DECIDE" : {
			"name" : "DECIDE",
			"uniqueLetter" : "D",
			"count" : 308,
			"previous" : [ "EXAMINE CASUALLY", "CHECK TICKET",
					"EXAMINE THOROUGHLY" ],
			"next" : [ "PAY COMPENSATION", "REINITIATE REQUEST",
					"REJECT REQUEST" ],
			"resources" : {
				"Sara" : [ 578640000, 583920000, 79920000, 845340000,
						247740000, 172560000, 76740000, 72360000, 522720000,
						515400000, 507960000, 1800000, 89160000, 515400000,
						507960000, 172560000, 76740000, 180360000, 270720000,
						420300000, 242880000, 178680000, 187560000, 515400000,
						507960000, 578640000, 583920000, 79920000, 845340000,
						247740000, 1800000, 89160000, 72360000, 522720000,
						172560000, 76740000, 180360000, 270720000, 420300000,
						242880000, 178680000, 187560000, 180360000, 270720000,
						420300000, 242880000, 178680000, 187560000, 172560000,
						76740000, 578640000, 583920000, 79920000, 845340000,
						247740000, 515400000, 507960000, 72360000, 522720000,
						1800000, 89160000, 72360000, 522720000, 1800000,
						89160000, 72360000, 522720000, 1800000, 89160000,
						72360000, 522720000, 515400000, 507960000, 578640000,
						583920000, 79920000, 845340000, 247740000, 172560000,
						76740000, 578640000, 583920000, 79920000, 845340000,
						247740000, 172560000, 76740000, 180360000, 270720000,
						420300000, 242880000, 178680000, 187560000, 1800000,
						89160000, 180360000, 270720000, 420300000, 242880000,
						178680000, 187560000, 1800000, 89160000, 180360000,
						270720000, 420300000, 242880000, 178680000, 187560000,
						180360000, 270720000, 420300000, 242880000, 178680000,
						187560000, 1800000, 89160000, 172560000, 76740000,
						578640000, 583920000, 79920000, 845340000, 247740000,
						72360000, 522720000, 180360000, 270720000, 420300000,
						242880000, 178680000, 187560000, 515400000, 507960000,
						172560000, 76740000, 578640000, 583920000, 79920000,
						845340000, 247740000, 578640000, 583920000, 79920000,
						845340000, 247740000, 172560000, 76740000, 515400000,
						507960000, 180360000, 270720000, 420300000, 242880000,
						178680000, 187560000, 578640000, 583920000, 79920000,
						845340000, 247740000, 1800000, 89160000, 515400000,
						507960000, 72360000, 522720000, 72360000, 522720000,
						515400000, 507960000, 1800000, 89160000, 515400000,
						507960000, 578640000, 583920000, 79920000, 845340000,
						247740000, 172560000, 76740000, 180360000, 270720000,
						420300000, 242880000, 178680000, 187560000, 515400000,
						507960000, 72360000, 522720000, 172560000, 76740000,
						578640000, 583920000, 79920000, 845340000, 247740000,
						1800000, 89160000, 180360000, 270720000, 420300000,
						242880000, 178680000, 187560000, 72360000, 522720000 ]
			},
			"avgTime" : 303934736,
			"index" : 4,
			"type" : "NORMAL"
		},
		"EXAMINE THOROUGHLY" : {
			"name" : "EXAMINE THOROUGHLY",
			"uniqueLetter" : "C",
			"count" : 77,
			"previous" : [ "REINITIATE REQUEST", "REGISTER REQUEST" ],
			"next" : [ "DECIDE" ],
			"resources" : {
				"Sue" : [ 83040000, 83040000, 83040000, 83040000, 83040000,
						83040000, 83040000, 83040000, 83040000, 83040000,
						83040000 ],
				"Sean" : [ 599640000, 2880000, 171660000, 171660000, 599640000,
						2880000, 171660000, 171660000, 599640000, 2880000,
						599640000, 2880000, 171660000, 599640000, 2880000,
						171660000, 171660000, 599640000, 2880000, 171660000,
						599640000, 2880000, 599640000, 2880000, 171660000,
						599640000, 2880000, 599640000, 2880000, 171660000,
						171660000, 599640000, 2880000 ]
			},
			"avgTime" : 214305000,
			"index" : 3,
			"type" : "NORMAL"
		},
		"REJECT REQUEST" : {
			"name" : "REJECT REQUEST",
			"uniqueLetter" : "E",
			"count" : 66,
			"previous" : [ "DECIDE" ],
			"next" : [ "END1" ],
			"resources" : {
				"Pete" : [ 97560000, 97560000, 97560000, 97560000, 97560000,
						97560000, 97560000, 97560000, 97560000, 97560000,
						97560000 ],
				"Ellen" : [ 272520000, 272520000, 272520000, 272520000,
						272520000, 272520000, 272520000, 272520000, 272520000,
						272520000, 272520000 ],
				"Mike" : [ 92640000, 92640000, 92640000, 92640000, 92640000,
						92640000, 92640000, 92640000, 92640000, 92640000,
						92640000 ]
			},
			"avgTime" : 154240000,
			"index" : 5,
			"type" : "END"
		},
		"REGISTER REQUEST" : {
			"name" : "REGISTER REQUEST",
			"uniqueLetter" : "A",
			"count" : 134,
			"previous" : [ "START0" ],
			"next" : [ "EXAMINE CASUALLY", "CHECK TICKET", "EXAMINE THOROUGHLY" ],
			"resources" : {
				"Pete" : [ 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588 ],
				"Ellen" : [ 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588, 9524588 ],
				"Mike" : [ 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588, 9524588,
						9524588, 9524588, 9524588, 9524588, 9524588 ]
			},
			"avgTime" : 9524588,
			"index" : 1,
			"type" : "START"
		}
	},
	"borderEvents" : {
		"END1" : {
			"name" : "END1",
			"ref" : "01",
			"previous" : [ "REJECT REQUEST" ],
			"next" : [],
			"type" : "END"
		},
		"END2" : {
			"name" : "END2",
			"ref" : "02",
			"previous" : [ "PAY COMPENSATION" ],
			"next" : [],
			"type" : "END"
		},
		"START0" : {
			"name" : "START0",
			"ref" : "00",
			"previous" : [],
			"next" : [ "REGISTER REQUEST" ],
			"type" : "START"
		}
	},
	"details" : {
		"averageTime" : 952458816,
		"totalCases" : 67
	}
}