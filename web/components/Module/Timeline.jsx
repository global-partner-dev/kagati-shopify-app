import React from 'react';
import { Box, Text } from '@shopify/polaris';
import { api } from '../../api';
import { formaterTime } from '../../util/commonFunctions';
import './Timeline.css';

// Base Timeline Components
const TimelineBase = ({ title = "Timeline", children }) => {
  return (
    <>
      <Box borderblockend="divider" padding="4">
        <Text variant="headingMd">{title}</Text>
      </Box>
      <div className="timeline-container">
        <ul className="tl">
          {children}
        </ul>
      </div>
    </>
  );
};

const TimelineItem = ({ title, timestamp, isDashed }) => {
  return (
    <li className={`tl-item`}>
      <div className="item-icon"></div>
      <div className="item-text">
        <div className="item-title">{title}</div>
      </div>
      <div className="item-timestamp">{timestamp}</div>
    </li>
  );
};

const TimelineDate = ({ title, isDashed }) => {
  return (
    <div className="timeline-date">
      <div className="date-content">
        <div className="date-title">{title}</div>
      </div>
      {isDashed && <div className="date-dashed-line" />}
    </div>
  );
};

// Helper function for relative dates
const getRelativeDate = (date) => {
  const today = new Date();
  const eventDate = new Date(date);
  
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - eventDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(eventDate);
};

// Main OrderTimeline component
const OrderTimeline = ({ orderId }) => {
  const [timelineData, setTimelineData] = React.useState(null);

  // Status messages mapping
  const statusMessages = {
    draft: "Draft order created successfully.",
    delivered: "Order status changed to delivered.",
    out_for_delivery: "Order status changed to out for delivery.",
    ready_for_pickup: "Order status changed to ready for pickup.",
    confirm: "Order status changed to confirmed.",
    on_hold: "Order status changed to on hold.",
    new: "Order placed"
  };

  // Status order
  const statusOrder = ['draft', 'new', 'on_hold', 'confirm', 'ready_for_pickup', 'out_for_delivery', 'delivered'];

  React.useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const splits = await api.khagatiOrderSplit.findMany({
          select: {
            timeStamp: true,
            orderNumber: true
          },
          filter: {
            orderReferenceId: { equals: orderId },
          },
        });

        if (splits && splits.length > 0 && splits[0].timeStamp) {
          const timeStamp = splits[0].timeStamp;
          const validTimestamps = Object.entries(timeStamp).filter(
            ([key, value]) => value && !isNaN(new Date(value).getTime())
          );
          
          const statusMap = Object.fromEntries(validTimestamps);
          const timelineItems = statusOrder
            .filter(status => status in statusMap)
            .map(status => ({
              status,
              message: statusMessages[status],
              timestamp: statusMap[status],
              rawTimestamp: statusMap[status],
              dateGroup: getRelativeDate(statusMap[status])
            }));

          timelineItems.sort((a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp));

          const groupedItems = timelineItems.reduce((acc, item) => {
            if (!acc[item.dateGroup]) {
              acc[item.dateGroup] = [];
            }
            acc[item.dateGroup].push(item);
            return acc;
          }, {});

          setTimelineData(groupedItems);
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  if (!timelineData) {
    return null;
  }

  return (
    <TimelineBase title="Order Status Timeline">
      {Object.entries(timelineData).map(([dateGroup, items], groupIndex) => (
        <React.Fragment key={dateGroup}>
          <TimelineDate
            title={dateGroup}
            isDashed={groupIndex !== Object.keys(timelineData).length - 1}
          />
          {items.map((item, itemIndex) => (
            <TimelineItem
              key={item.status}
              title={item.message}
              timestamp={formaterTime(item.timestamp)}
              isDashed={!(groupIndex === Object.keys(timelineData).length - 1 && 
                        itemIndex === items.length - 1)}
            />
          ))}
        </React.Fragment>
      ))}
    </TimelineBase>
  );
};

export default OrderTimeline;