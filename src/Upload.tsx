import { Button, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import Ajv from "ajv";
import { bytesToBase64 } from "./base64";
import pako from "pako";
import React from "react";
import { useDropzone } from "react-dropzone";
import { SimResults } from "./Viewer/DataType";
import schema from "./Viewer/DataType.schema.json";
import axios from "axios";

const ajv = new Ajv();
// axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Upload() {
  const [data, setData] = React.useState<Uint8Array | null>(null);
  const [msg, setMsg] = React.useState<string>("");
  const [color, setColor] = React.useState<string>("text-green-800");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [author, setAuthor] = React.useState<string>("");
  const [desc, setDesc] = React.useState<string>("");
  const [apiKey, setAPIKey] = React.useState<string>("");
  const [result, setResult] = React.useState<string | null>(null);

  const onDrop = React.useCallback((acceptedFiles) => {
    //do stuff?
    if (acceptedFiles.length > 0) {
      const reader = new FileReader();
      const file: File = acceptedFiles[0];

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = new Uint8Array(reader.result as ArrayBuffer);
        console.log(binaryStr);
        try {
          const restored = pako.inflate(binaryStr, { to: "string" });
          //next try and parse this
          let parsed: SimResults = JSON.parse(restored);
          const validate = ajv.compile(schema.definitions["*"]);
          const valid = validate(parsed);

          if (valid) {
            setData(binaryStr);

            let msg = "Data loaded ok for team: ";
            parsed.char_names.forEach((e) => {
              msg += " " + e + ",";
            });
            msg = msg.substring(0, msg.length - 1);
            msg +=
              ": " +
              parsed.dps.mean.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              }) +
              " avg dps.";

            setMsg(msg);
            setColor("text-green-800");
          } else {
            console.log("invalid data");
            setMsg(
              "File " +
                file.name +
                " is not a valid viewer file due to error: " +
                JSON.stringify(validate.errors, null, 2)
            );
            setColor("text-red-700");
          }
        } catch (err) {
          console.log(err);
          setMsg("File " + file.name + " is not a valid gzipped JSON file");
          setColor("text-red-700");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const lockButton = (
    <Button
      icon={showPassword ? "unlock" : "lock"}
      intent={Intent.WARNING}
      minimal={true}
      onClick={() => setShowPassword(!showPassword)}
    />
  );

  const handleUpload = () => {
    if (data === null) {
      return;
    }
    setResult("");
    //encode to base64
    let s = bytesToBase64(data);

    axios({
      method: "post",
      url: "https://api.gcsim.app/upload/",
      headers: { "x-api-key": apiKey, "Access-Control-Allow-Origin": "*" },
      data: {
        author: author,
        description: desc,
        data: s,
      },
    })
      .then((response) => {
        console.log(response);
        if (response.data.id) {
          setResult(
            `Upload ok, visit the uploaded file at https://viewer.gcsim.app/share/${response.data.id}`
          );
        } else {
          setResult("upload failed");
        }
      })
      .catch((error) => {
        console.log(error);
        setResult("error encountered: " + error);
      });
  };

  return (
    <div className="h-screen">
      <div className=" p-8 flex flex-col gap-4 place-content-center items-center">
        <div
          {...getRootProps()}
          className="border-dashed border-2 p-8 h-48 w-2/3 flex place-content-center items-center focus:outline-none"
        >
          <div>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-lg">Drop the file here ...</p>
            ) : (
              <p className="text-lg">
                Drag 'n' drop gzipped json file from gcsim here, or click to
                select
              </p>
            )}
          </div>
        </div>
        {msg === "" ? null : <p className={"text-lg " + color}>{msg}</p>}
        {data === null ? null : (
          <div>
            <FormGroup
              label="Author"
              labelFor="upload-author"
              labelInfo="(required)"
            >
              <InputGroup
                id="upload-author"
                placeholder="Enter author name..."
                type="text"
                value={author}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setAuthor(e.currentTarget.value);
                }}
              />
            </FormGroup>
            <FormGroup
              label="Description"
              labelFor="upload-desc"
              labelInfo="(required)"
            >
              <InputGroup
                id="upload-desc"
                placeholder="Enter description..."
                type="text"
                value={desc}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setDesc(e.currentTarget.value);
                }}
              />
            </FormGroup>
            <FormGroup
              label="Upload password"
              labelFor="upload-password"
              labelInfo="(required)"
            >
              <InputGroup
                id="upload-password"
                placeholder="Enter upload password..."
                rightElement={lockButton}
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setAPIKey(e.currentTarget.value);
                }}
              />
            </FormGroup>

            <Button
              intent={Intent.PRIMARY}
              disabled={author === "" || desc === "" || apiKey === ""}
              onClick={handleUpload}
            >
              upload
            </Button>
          </div>
        )}
        {result == null ? null : <div>{result}</div>}
      </div>
    </div>
  );
}
