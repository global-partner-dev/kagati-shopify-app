/**
 * PopoverComponent
 * 
 * This component provides a popover with an action list using Shopify's Polaris `Popover` and `ActionList` components.
 * The popover contains a list of actions that the user can select from, such as "Import" or "Export". The visibility 
 * of the popover is controlled by a toggle function.
 * 
 * @param {boolean} popoverAction - A boolean value that determines whether the popover is initially active or not.
 * 
 * @returns {JSX.Element} A component that renders a popover containing an action list with options.
 */

import { Popover, ActionList } from '@shopify/polaris';
import { useState, useCallback } from 'react';

const PopoverComponent = ({ popoverAction }) => {
  const [popoverActive, setPopoverActive] = useState(popoverAction);

  // Toggles the visibility of the popover
  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  return (
    <div style={{ height: '250px' }}>
      <Popover
        active={popoverActive}
        activator={activator} // The activator is expected to be passed or defined elsewhere
        autofocusTarget="first-node"
        onClose={togglePopoverActive}
      >
        <ActionList
          actionRole="menuitem"
          items={[{ content: 'Import' }, { content: 'Export' }]}
        />
      </Popover>
    </div>
  );
}

export default PopoverComponent;