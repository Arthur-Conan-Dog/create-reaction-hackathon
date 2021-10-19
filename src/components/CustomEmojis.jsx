import * as React from "react";
import {
  Grid,
  Image,
  Button,
  gridHorizontalBehavior,
} from "@fluentui/react-northstar";
import { AddIcon } from "@fluentui/react-icons-northstar";
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { getCustomImages } from "./data";
import { uploadUserImage } from "./data";

const imageButtonStyles = {
  width: "calc(100% - 10px)",
  height: "80%",
  margin: "10px 5px",
};

const AddEmoji = ({ style, userId, setReload }) => {
  const fileInputRef = React.useRef(null);

  const onAddButtonClick = React.useCallback(() => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  });

  const fileUploadInputChange = React.useCallback((event) => {
    if (event.target.files) {
      const file = event.target.files[0];
      let reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const index = data.indexOf("base64,");
        const imgData = data.substring(index + 7);
        const name = file.name.split(".")[0];
        uploadUserImage(userId, imgData, name);
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
        icon={<AddIcon />}
        content="Upload"
      ></Button>
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
      setAllEmojis(emojis);
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
