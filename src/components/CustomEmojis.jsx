import * as React from "react";
import {
  Grid,
  Image,
  Button,
  gridHorizontalBehavior,
  AddIcon,
  Text,
} from "@fluentui/react-northstar";
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { getAllMockEmojis } from "./MockData";
import { getCustomImages, selectCustomImage } from "./data";
import { uploadUserImage } from "./data";

const imageButtonStyles = {
  width: "calc(100% - 10px)",
  height: "80%",
  margin: "10px 5px",
};

const AddEmoji = ({ style, userId }) => {
  const fileInputRef = React.useRef(null);

  const onAddButtonClick = React.useCallback(() => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  });

  const fileUploadInputChange = React.useCallback((event) => {
    // Todo: get upload file and update to server
    // uploaded file: e.target.value
    // upload to server
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const index = data.indexOf("base64,");
        const imgData = data.substring(index + 7);
        uploadUserImage(userId, imgData);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  });

  return (
    <div style={style}>
      <input
        id="fileButton"
        ref={fileInputRef}
        onChange={fileUploadInputChange}
        type="file"
        hidden
      />
      <Button
        text
        key={"add_emoji"}
        styles={imageButtonStyles}
        onClick={onAddButtonClick}
      >
        <AddIcon />
        <Text weight="semibold" content="Upload Emoji" />
      </Button>
    </div>
  );
};

const EmojiRenderer = (props) => {
  const { columnIndex, data, rowIndex, style, userId } = props;
  const index = rowIndex * data.columnCount + columnIndex;

  const item =
    data.items && data.items.length > index ? data.items[index] : null;
  if (!item) {
    return null;
  }
  if (item.id === "add-emoji") {
    return <AddEmoji style={style} userId={userId} />;
  }

  const onEmojiClick = (emoji) => {
    selectCustomImage(
      emoji.id,
      data.userId,
      data.messageId,
      data.convId,
      emoji.src
    );
  };

  return (
    <div style={style}>
      <Button
        styles={imageButtonStyles}
        text
        key={item.id}
        title={item.name}
        onClick={() => onEmojiClick(item)}
      >
        <Image style={{ maxHeight: "100%", maxWidth: "100%" }} src={item.src} />
      </Button>
    </div>
  );
};

export const CustomEmojisComponent = ({ messageId, userId, convId }) => {
  const [allEmojis, setAllEmojis] = React.useState([]);
  React.useEffect(() => {
    getCustomImages(userId).then((emojis) => {
      if (!emojis) {
        setAllEmojis(getAllMockEmojis());
      } else {
        setAllEmojis(emojis);
      }
    });
  }, []);

  const gridData = [{ id: "add-emoji" }, ...allEmojis];

  const columnCount = 6;
  const rowCount = Math.ceil(gridData.length / columnCount);
  const itemData = React.useMemo(() => ({
    columnCount,
    items: gridData,
    messageId,
    userId,
    convId,
  }));

  const autoSizerChild = (height, width) => {
    const columnWidth = Math.floor(width / columnCount);
    return (
      <FixedSizeGrid
        className={"FixedSizeGrid"}
        columnCount={columnCount}
        rowCount={rowCount}
        width={width}
        height={height}
        columnWidth={columnWidth}
        rowHeight={150}
        initialScrollTop={0}
        itemData={itemData}
        style={{ overflowX: "hidden" }}
        userId={userId}
      >
        {EmojiRenderer}
      </FixedSizeGrid>
    );
  };

  const virtualizedGrid = (
    <AutoSizer>
      {({ height, width }) => autoSizerChild(height, width)}
    </AutoSizer>
  );

  return (
    <Grid
      accessibility={gridHorizontalBehavior}
      content={virtualizedGrid}
      style={{ height: "100%", width: "100%" }}
    />
  );
};
