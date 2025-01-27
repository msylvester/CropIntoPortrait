# 🎥 Video Cropper 📐

A React component that allows users to crop landscape videos into portrait 

## ✨ Features

- 🎬 Live preview of the cropped frame
- 🖼️ Export high-resolution (1920x1080) PNG frames
- 🎯 Maintains perfect 16:9 aspect ratio
- 🖥️ Responsive design with mobile support

## 🚀 Usage

```jsx
import VideoCropper from './VideoCropper';

function App() {
  return (
    <div>
      <VideoCropper />
    </div>
  );
}
```

## 💡 How It Works

1. Upload any video file
2. Use the slider to adjust the vertical position of the 16:9 crop window
3. Preview the result in real-time
4. Click "Export Frame" to download a high-resolution PNG

## 🎨 Styling

The component uses Tailwind CSS for styling and includes:
- Responsive grid layout
- Clean, modern UI
- Shadow and rounded corners
- Hover states for interactive elements

## 🛠️ Dependencies

- React
- Tailwind CSS
- Modern browser with HTML5 video support

## 🎯 Technical Details

- Preview canvas: 640x360 (16:9)
- Export resolution: 1920x1080 (16:9)
- Supported video formats: Any format supported by HTML5 video

## 🌟 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

MIT License - feel free to use this component in your projects!

---

Made with ❤️ for video content creators