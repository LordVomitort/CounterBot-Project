// import { useEffect, useState } from "react";
// import { ApiData, httpCLient } from "../services/api";

// const useBachendConnection = () => {
//     const [data, setData] = useState<ApiData[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [ws, setWs] = useState<WebSocket | null>(null);

//     // metodo para procesar los datos
//     const processData = (rawData: any): ApiData => {
//         return {
//             id: rawData.id,
//         };
//     };

//     const fetchData = async () => {
//         // try {
//         //     setIsLoading(true);
//         //     const response=await httpCLient.get("")
//         // }
//     };

//     useEffect(() => {
//         const webSocket = new WebSocket("ws://localhost:3000");
//         setWs(webSocket);

//         webSocket.onmessage("event",)
//     }, []);
// };

// export default useBachendConnection;
