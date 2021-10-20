import * as React from "react";
import { Menu } from "@fluentui/react-northstar";
import { Camera } from "./Camera";
import { CustomEmojisComponent as CustomEmojisRenderer } from "./CustomEmojis";
import { useLocation } from "react-router-dom";
import "./MainPage.css";

const menuItemStyles = {
  paddingBottom: "0.75rem",
  ":hover": {
    paddingBottom: "0.75rem",
  },
};

const items = [
  {
    key: "all_emojis",
    content: "All Emojis",
    styles: menuItemStyles,
  },
  {
    key: "shoot_emoji",
    content: "Shoot One",
    styles: menuItemStyles,
  },
];

export const MainPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const messageId = query.get("messageId");
  const userId = query.get("userId");
  const convId = query.get("convId");

  const [activeIndex, setActiveIndex] = React.useState(0);
  const onActiveIndexChange = React.useCallback((i, j) => {
    setActiveIndex(j.activeIndex);
  });

  return (
    <div id="main-page" style={{ height: "100%" }}>
      <Menu
        defaultActiveIndex={0}
        items={items}
        underlined
        primary
        onActiveIndexChange={onActiveIndexChange}
      />
      {activeIndex === 0 && (
        <CustomEmojisRenderer
          messageId={messageId}
          userId={userId}
          convId={convId}
        />
      )}
      {activeIndex === 1 && <Camera userId={userId} />}
    </div>
  );
};
