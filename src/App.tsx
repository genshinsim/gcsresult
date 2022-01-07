import React from "react";
import { useDropzone } from 'react-dropzone'
import pako from 'pako'
import { Viewer } from "./Viewer/Viewer";
import { Button } from "@blueprintjs/core";

export function App() {

  const [data, setData] = React.useState<string>("")

  const onDrop = React.useCallback(acceptedFiles => {
    //do stuff?
    if (acceptedFiles.length > 0) {
      const reader = new FileReader()
      const file = acceptedFiles[0]

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = new Uint8Array(reader.result as ArrayBuffer)
        console.log(binaryStr)
        try {
          const restored = pako.inflate(binaryStr, { to: 'string' });
          // ... continue processing
          console.log(restored)
          setData(restored)
        } catch (err) {
          console.log(err);
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleClose = () => {
    setData("")
  }

  return (
    <div className="bp3-dark h-screen">
      {
        data == "" ?

          <div {...getRootProps()} className="border-dashed h-full p-8 flex place-content-center items-center">
            <div className="border-dashed border-2 p-8 h-full w-full flex place-content-center items-center">
              <div>
                <input {...getInputProps()} />
                {
                  isDragActive ?
                    <p className="text-lg">Drop the file here ...</p> :
                    <p className="text-lg">Drag 'n' drop .gcsresult file here, or click to select</p>
                }
              </div>
            </div>
          </div>
          :
          <div className="p-8 h-full flex flex-col">
            <Viewer data={data} names="p-4 rounded-lg bg-gray-800 grow" handleClose={handleClose} />
          </div>
      }

    </div>
  );
}
