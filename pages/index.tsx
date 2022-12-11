import Head from "next/head";
import { useCallback, useState } from "react";
import { useMux } from "../hooks/useMux";
import { v4 as uuid } from "uuid";
import { useFileSelect } from "../hooks/useSelectFile";
import { useLiveEdit } from "../hooks/useLiveEdit";
import { useSuperStore } from "../store/useSuperStore";
import { EditProps } from "../store/superTypes.types";
import { useRouter } from "next/router";
import { Page } from "../components/Page";

function Home() {
  const [id, setId] = useState(uuid());
  const { handleUpload, progressPercent } = useMux({ id: id });
  const router = useRouter();

  const onSelect = useCallback((acceptedFiles: File[]) => {
    handleUpload(acceptedFiles);
    router.push(`/${id}?password=superpass`);
  }, []);

  const { selectFile } = useFileSelect({ onSelect: onSelect });

  useLiveEdit();
  const edit: EditProps = useSuperStore((state) => state[`Edit:${id}`]);

  return (
    <Page>
      <div className="h-screen">
        <div className="flex h-1/2 flex-col items-center justify-center bg-gray-100">
          <div className="absolute top-0 left-0 flex h-[60px] w-full flex-col items-center justify-center">
            <div className="w-full px-6">Supercut</div>
          </div>
          <div className="flex w-4/12 flex-col items-center">
            <h1 className="text-center text-[52px] font-medium leading-tight">
              Automagically make shareable social video clips
            </h1>
            <h3 className="text-lg mt-4">Perfect for Podcast clipping 🚀</h3>
          </div>
        </div>
        <div className="flex h-1/2 flex-col items-center justify-center">
          <button
            className="btn-secondary"
            disabled={progressPercent !== null}
            onClick={selectFile}
          >
            Upload Video
          </button>
        </div>
      </div>
    </Page>
  );
}

export async function getServerSideProps(ctx) {
  const password = ctx.query?.password;

  console.log("password", password);

  if (password === "superpass") {
    return {
      props: {},
    };
  } else {
    return {
      redirect: {
        destination: "/password",
        permanent: false,
      },
    };
  }
}

export default Home;
