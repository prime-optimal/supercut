import { useCallback, useState } from "react";
import { useMux } from "../hooks/useMux";
import { v4 as uuid } from "uuid";
import { useFileSelect } from "../hooks/useSelectFile";
import { useLiveEdit } from "../hooks/useLiveEdit";
import { useRouter } from "next/router";
import { Page } from "../components/Page";
import { ArrowRight, UploadCloud } from "react-feather";

function Home() {
  const [id, setId] = useState(uuid());
  const { handleUpload } = useMux({ id: id });
  const router = useRouter();

  const onSelect = useCallback(
    (acceptedFiles: File[]) => {
      handleUpload(acceptedFiles);
      router.push(`/${id}`);
    },
    [id, handleUpload, router]
  );

  const { selectFile } = useFileSelect({ onSelect: onSelect });
  useLiveEdit();

  return (
    <Page seo={{ title: "Supercut" }}>
      <div className="h-screen">
        <div className="flex h-1/2 flex-col items-center justify-center bg-gray-100">
          <div className="absolute top-0 left-0 flex h-[60px] w-full flex-col items-center justify-center">
            <div className="text-lg px-6 font-medium">⚡️ Supercut</div>
          </div>
          <div className="flex flex-col items-center p-4 lg:w-5/12">
            <h1 className="text-center text-[32px] font-medium leading-tight lg:text-[42px]">
              Automagically make shareable podcast video clips
            </h1>
            <h3 className="text-lg mt-4 text-gray-700">
              Perfect for Twitter, YouTube & TikTok 🚀
            </h3>
          </div>
        </div>
        <div className="flex h-1/2 flex-col items-center justify-center">
          <div className="my-auto flex w-full flex-col items-center p-4 lg:w-4/12 xl:w-3/12">
            <div
              className="mb-2 flex cursor-pointer flex-row items-center rounded-md border border-solid border-gray-200 p-6 hover:border-gray-300"
              onClick={selectFile}
            >
              <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-gray-100 text-gray-900">
                <UploadCloud size={20} />
              </div>
              <div className="ml-3 mr-3 flex flex-col">
                <span className="my-1 text-md">Upload podcast recording</span>
                <span className="mb-1 text-base text-gray-600">
                  Drop your recording file here, click to browse
                </span>
              </div>
            </div>
            <span className="flex flex-row items-center text-base">
              <span className="text-gray-500">
                Don&apos;t have a recording?{" "}
              </span>
              <div
                onClick={() =>
                  router.push("/a1d0f68c-6ecd-45bd-9e98-d00efe03a978")
                }
                className="ml-1 flex cursor-pointer flex-row items-center text-base hover:underline"
              >
                <span>View example</span>
                <ArrowRight size={14} />
              </div>
            </span>
          </div>
          <div className="mt-auto flex justify-center p-4">
            <div>
              <span className="text-center text-base text-gray-500">
                Made by{" "}
                <a
                  className="text-gray-900 hover:underline"
                  href="https://twitter.com/XavierEnglish8"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xavier
                </a>{" "}
                &{" "}
                <a
                  className="text-gray-900 hover:underline"
                  href="https://twitter.com/zacgoods"
                  target="_blank"
                  rel="noreferrer"
                >
                  Zac
                </a>{" "}
                for the{" "}
                <a
                  className="text-base text-gray-900 hover:underline"
                  href="https://hackathon.assemblyai.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dec 2022 AssemblyAI Hackathon
                </a>{" "}
                view the code on{" "}
                <a
                  href="https://github.com/something-app/supercut"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base text-gray-900 hover:underline"
                >
                  Github
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export async function getServerSideProps(ctx) {
  // const password = ctx.query?.password;

  // if (password === "superpass") {
  return {
    props: {},
  };
  // } else {
  //   return {
  //     redirect: {
  //       destination: "/password",
  //       permanent: false,
  //     },
  //   };
  // }
}

export default Home;
