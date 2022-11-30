var size = 300;

var pulsingDot_randomColors = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
	
	colors = ['rgba(3,189,91,0.8)','rgba(203,46,86,0.8)','rgba(0,129,213,0.8)','rgba(255,153,71,0.8)','rgba(31,51,73,0.8)'];
	index=Math.floor(Math.random() * colors.length);

	var radius = size / 2 * 0.3;
        var context = this.context;

	// draw inner circle
        //context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = colors[index];
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4;
        context.fill();
        context.stroke();


	// update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;
    },

    render: function() {
        // return `true` to let the map know that the image was updated
        return true;
    }
};
