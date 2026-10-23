import { useParams } from "react-router-dom";
import { ContentPage } from "@/pages/ContentPage";
export function DynamicContentPage() { const { slug } = useParams(); return <ContentPage slug={slug ?? "home"} />; }
