"use strict";
/*jshint node: true */

var Sankey = require("./sankey");

// Sankey diagram with a hoverable selection
module.exports = Sankey.extend("Sankey.Selection", {

	initialize: function() {
		var chart = this;

		chart.features.selection = null;
		chart.features.selectionTarget = null;
		chart.features.selectionLocked = false;
		chart.features.unselectedOpacity = 0.2;

		chart.on("link:mouseover", chart.selection);
		chart.on("link:mouseout", function() { chart.selection(null); });
		chart.on("link:click", function(_) {
			if(!chart.features.selectionLocked) {
				chart.features.selectionLocked = true;
				chart.selection(_);
				updateTargetText();
			} else {
				chart.features.selectionLocked = false;
				chart.selection(null);
				chart.layers.base.selectAll(".node .bold").remove();
			}
		});
		chart.on("node:mouseover", chart.selection);
		chart.on("node:mouseout", function() { chart.selection(null); });
		chart.on("node:click", function(_) {
			if(!chart.features.selectionLocked) {
				chart.features.selectionLocked = true;
				chart.selection(_);
				updateTargetText();
			} else {
				chart.features.selectionLocked = false;
				chart.selection(null);
				chart.layers.base.selectAll(".node .bold").remove();
			}
		});

		// going through the whole draw cycle can be a little slow, so we use
		// a selection changed event to update existing nodes directly
		chart.on("change:selection", updateTransition);
		this.layer("links").on("enter", update);
		this.layer("nodes").on("enter", update);

		function update() {
			/*jshint validthis:true */
			if (chart.features.selection && chart.features.selection.length) {
				return this.style("opacity", function(o) {
					return chart.features.selection.indexOf(o) >= 0 ? 1 : chart.features.unselectedOpacity;
				});
			} else {
				return this.style("opacity", 1);
			}
		}

		function updateTransition() {
			if (!chart.features.selectionLocked) {
				var transition = chart.layers.base.selectAll(".node, .link").transition();
				if (!chart.features.selection || !chart.features.selection.length) {
					// short delay for the deselect transition to avoid flicker
					transition = transition.delay(100);
				}
				update.apply(transition.duration(50));
			}
		}

		function updateTargetText() {
			var nodes = chart.layers.base.selectAll(".node");

			nodes = nodes
				.filter(function (o) {
					// return chart.features.selection.indexOf(o) >= 0 && o.targetLinks.length > 0;
					return chart.features.selection.indexOf(o) >= 0;
				});

			nodes.append("text")
				.attr("dy", ".35em")
				.attr("y", function(d) { return d.dy / 2; })
				.attr("x", chart.features.nodeWidth/2)
				.attr("class", "bold")
				.attr("text-anchor", "middle")
				.text(function (o) {
					if(o === chart.features.selectionTarget) {
						return chart.features.selectionTarget.value;
					}
					var s = chart.features.selection.find(function (s) {
						return (o.targetLinks.length > 0 && s.target && s.target.name === o.name) ||
							(o.sourceLinks.length > 0 && s.source && s.source.name === o.name);
					});
					return s.value;
				});
		}
	},

	selection: function(_) {
		if (!arguments.length) { return this.features.selection; }
		this.features.selection = (!_ || _ instanceof Array) ? _ : [_];

		this.trigger("change:selection");

		return this;
	},

	unselectedOpacity: function(_) {
		if (!arguments.length) { return this.features.unselectedOpacity; }
		this.features.unselectedOpacity = _;

		this.trigger("change:selection");

		return this;
	}

});
