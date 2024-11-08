import { LightningElement, api, track } from 'lwc';

export default class LWC_PreviewBase64asImage extends LightningElement {
    @api base64files;
    @track currentIndex = 0;
    @track imageClass = 'fade-in';
    @track containerStyle = '';

    connectedCallback() {
        this.adjustContainerSize();
        window.addEventListener('resize', this.adjustContainerSize.bind(this));
        window.addEventListener('orientationchange', this.adjustContainerSize.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.adjustContainerSize.bind(this));
        window.removeEventListener('orientationchange', this.adjustContainerSize.bind(this));
    }

    adjustContainerSize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const pixelRatio = window.devicePixelRatio || 1;
        const isLandscape = screenWidth > screenHeight;
        let containerWidth, containerHeight;

        if (this.isMobileDevice()) {
            if (isLandscape) {
                containerWidth = '90%';
                containerHeight = '80vh';
            } else {
                containerWidth = '95%';
                containerHeight = '60vh';
            }
        } else if (screenWidth > 1200 && pixelRatio < 2) {
            containerWidth = '80%';
            containerHeight = '80vh';
        } else if (screenWidth > 768 || (screenWidth > 480 && pixelRatio >= 2)) {
            containerWidth = '90%';
            containerHeight = '70vh';
        } else {
            containerWidth = '95%';
            containerHeight = '60vh';
        }

        this.containerStyle = `width: ${containerWidth}; height: ${containerHeight}; max-height: 800px;`;
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    get currentImage() {
        if (this.base64files && this.base64files.length > 0) {
            const base64String = this.base64files[this.currentIndex];
            const imageType = this.getImageType(base64String);
            return `data:${imageType};base64,${base64String}`;
        }
        return '';
    }

    getImageType(base64String) {
        const signatures = {
            '/9j/': 'image/jpeg',
            'iVBORw0KGgo': 'image/png',
            'R0lGODlh': 'image/gif',
            'Qk0': 'image/bmp'
        };

        for (const [signature, mimeType] of Object.entries(signatures)) {
            if (base64String.startsWith(signature)) {
                return mimeType;
            }
        }

        return 'image/jpeg';
    }

    handleNext() {
        if (this.currentIndex < this.base64files.length - 1) {
            this.fadeOut(() => {
                this.currentIndex++;
                this.fadeIn();
            });
        }
    }

    handlePrevious() {
        if (this.currentIndex > 0) {
            this.fadeOut(() => {
                this.currentIndex--;
                this.fadeIn();
            });
        }
    }

    fadeOut(callback) {
        this.imageClass = 'fade-out';
        setTimeout(() => {
            callback();
        }, 200);
    }

    fadeIn() {
        this.imageClass = 'fade-in';
    }

    get disableNext() {
        return this.currentIndex === this.base64files.length - 1;
    }

    get disablePrevious() {
        return this.currentIndex === 0;
    }
    
    handleDownload() {
        if (this.currentImage) {
            const link = document.createElement('a');
            link.href = this.currentImage;
            link.download = `image_${this.currentIndex + 1}.${this.getFileExtension()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    getFileExtension() {
        const mimeType = this.getImageType(this.base64files[this.currentIndex]);
        switch (mimeType) {
            case 'image/jpeg':
                return 'jpg';
            case 'image/png':
                return 'png';
            case 'image/gif':
                return 'gif';
            case 'image/bmp':
                return 'bmp';
            default:
                return 'jpg';
        }
    }
}