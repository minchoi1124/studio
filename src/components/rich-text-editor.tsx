"use client";
import React from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps extends ReactQuillProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

class RichTextEditor extends React.Component<RichTextEditorProps> {
  render() {
    const { value, onChange, placeholder, ...props } = this.props;

    const modules = {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link'],
        ['clean']
      ],
    };

    const formats = [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'list', 'bullet', 'indent',
      'link'
    ];

    return (
      <div className="bg-background">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-card"
          {...props}
        />
      </div>
    );
  }
}

export default RichTextEditor;
