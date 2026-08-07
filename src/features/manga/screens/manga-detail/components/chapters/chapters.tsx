import { ListGroup } from "heroui-native/list-group";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Separator } from "@/components/ui/separator";
import { CHAPTERS } from "../../../../mocks";
import { DownloadButton } from "../download-button";

export function Chapters() {
  return (
    <ListGroup className="w-full p-0">
      {CHAPTERS.map((chapter, index) => (
        <PressableFeedback key={chapter.id}>
          {index > 0 && <Separator className="mx-4" />}
          <ListGroup.Item disabled>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{chapter.title}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription>
                {chapter.date}
              </ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <DownloadButton />
            </ListGroup.ItemSuffix>
          </ListGroup.Item>
          <PressableFeedback.Highlight />
        </PressableFeedback>
      ))}
    </ListGroup>
  );
}
