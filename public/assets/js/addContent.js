document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('mediaFile');
    const fileLabel = document.getElementById('fileLabel');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const audioPreview = document.getElementById('audioPreview');

    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            imagePreview.style.display = 'none';
            videoPreview.style.display = 'none';
            audioPreview.style.display = 'none';

            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                const fileName = file.name;
                const fileType = file.type;
                const fileURL = URL.createObjectURL(file);

                fileLabel.textContent = `${this.files.length} fichier(s) sélectionné(s)`;

                if (fileType.startsWith('image/')) {
                    imagePreview.src = fileURL;
                    imagePreview.onload = () => {
                        imagePreview.style.display = 'block';
                    };
                } else if (fileType.startsWith('video/') || fileName.toLowerCase().endsWith('.mp4')) {
                    videoPreview.src = fileURL;
                    videoPreview.onloadedmetadata = () => {
                        videoPreview.style.display = 'block';
                    };
                } else if (fileType.startsWith('audio/') || fileName.toLowerCase().endsWith('.mp3')) {
                    audioPreview.src = fileURL;
                    audioPreview.onloadedmetadata = () => {
                        audioPreview.style.display = 'block';
                    };
                }
            } else {
                fileLabel.textContent = 'Aucun fichier sélectionné';
            }
        });
    }
});
