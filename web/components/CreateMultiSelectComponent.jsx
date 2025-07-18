/**
 * CreateMultiSelectComponent
 * 
 * This component is a customizable multi-select dropdown built using Shopify's Polaris library. It allows users to search, select, 
 * and manage multiple tags. The component also supports dynamic filtering of options based on user input and allows users to add 
 * new tags if no matches are found.
 * 
 * @param {function} setTags - A callback function that updates the parent component with the currently selected tags.
 * @param {array} tags - An array of pre-selected tags to initialize the component with.
 * @param {string} [error] - An optional error message to display if there is a validation issue.
 * 
 * @returns {JSX.Element} A multi-select dropdown component with tagging functionality and dynamic search.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { InlineStack, Tag, Listbox, EmptySearchResult, Combobox, Text, AutoSelection,Icon} from '@shopify/polaris';
import { PlusCircleIcon} from '@shopify/polaris-icons';

function CreateMultiSelectComponent({ setTags, tags, error }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [value, setValue] = useState('');
    const [suggestion, setSuggestion] = useState('');

    // Handles the change in active option within the Listbox
    const handleActiveOptionChange = useCallback(
        (activeOption) => {
            const activeOptionIsAction = activeOption === value;

            if (!activeOptionIsAction && !selectedTags.includes(activeOption)) {
                setSuggestion(activeOption);
            } else {
                setSuggestion('');
            }
        },
        [value, selectedTags]
    );

    // Updates the selected tags when an option is selected or deselected
    const updateSelection = useCallback(
        (selected) => {
            const nextSelectedTags = new Set([...selectedTags]);

            if (nextSelectedTags.has(selected)) {
                nextSelectedTags.delete(selected);
            } else {
                nextSelectedTags.add(selected);
            }
            setSelectedTags([...nextSelectedTags]);
            setTags([...nextSelectedTags]);
            setValue('');
            setSuggestion('');
        },
        [selectedTags, setTags]
    );

    // Removes a tag from the selected tags
    const removeTag = useCallback(
        (tag) => () => {
            updateSelection(tag);
        },
        [updateSelection]
    );

    // Retrieves all tags, ensuring uniqueness and sorting them
    const getAllTags = useCallback(() => {
        const savedTags = [];
        return [...new Set([...savedTags, ...selectedTags].sort())];
    }, [selectedTags]);

    // Formats the display of the options in the listbox, highlighting the matching text
    const formatOptionText = useCallback(
        (option) => {
            const trimValue = value.trim().toLowerCase();
            const matchIndex = option.toLowerCase().indexOf(trimValue);

            if (!value || matchIndex === -1) return option;

            const start = option.slice(0, matchIndex);
            const highlight = option.slice(matchIndex, matchIndex + trimValue.length);
            const end = option.slice(matchIndex + trimValue.length, option.length);

            return (
                <p>
                    {start}
                    <Text fontWeight="bold" as="span">
                        {highlight}
                    </Text>
                    {end}
                </p>
            );
        },
        [value]
    );

    // Escapes special characters in the search value to safely use it in a regex
    const escapeSpecialRegExCharacters = useCallback(
        (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        []
    );

    // Generates the list of options to be displayed in the listbox based on the input value
    const options = useMemo(() => {
        let list;
        const allTags = getAllTags();
        const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), 'i');

        if (value) {
            list = allTags.filter((tag) => tag.match(filterRegex));
        } else {
            list = allTags;
        }

        return [...list];
    }, [value, getAllTags, escapeSpecialRegExCharacters]);

    // Markup for displaying the selected tags
    const verticalContentMarkup = selectedTags.length > 0 ? (
        <InlineStack spacing="extraTight" alignment="center" gap="200">
            {selectedTags.map((tag) => (
                <Tag key={`option-${tag}`} onRemove={removeTag(tag)}>
                    {tag}
                </Tag>
            ))}
        </InlineStack>
    ) : null;

    // Markup for the list of options in the dropdown
    const optionMarkup =
        options.length > 0
            ? options.map((option) => (
                <Listbox.Option
                    key={option}
                    value={option}
                    selected={selectedTags.includes(option)}
                    accessibilityLabel={option}
                >
                    <Listbox.TextOption selected={selectedTags.includes(option)}>
                        {formatOptionText(option)}
                    </Listbox.TextOption>
                </Listbox.Option>
            ))
            : null;

    // Checks if the input value doesn't match any existing tags, allowing for a new tag to be created
    const noResults = value && !getAllTags().includes(value);

    // Markup for adding a new tag if no existing tag matches the input
    const actionMarkup = noResults ? (
        <Listbox.Action value={value}>
           <InlineStack align="center" gap="2"><Icon
          source={PlusCircleIcon}
          tone="base"
        />{`Add "${value}"`}</InlineStack></Listbox.Action>
    ) : null;

    // Markup for displaying an empty state if no tags match the input value
    const emptyStateMarkup = optionMarkup ? null : (
        <EmptySearchResult
            title=""
            description={`No tags found matching "${value}"`}
        />
    );

    // Combines all listbox-related markup
    const listboxMarkup = optionMarkup || actionMarkup || emptyStateMarkup ? (
            <Listbox
                autoSelection={AutoSelection.None}
                onSelect={updateSelection}
                onActiveOptionChange={handleActiveOptionChange}
            >
                {actionMarkup}
                {optionMarkup}
            </Listbox>
        ) : null;

    // Effect to initialize selected tags from props when the component mounts
    useEffect(() => {
        if (tags && tags.length) {
            setSelectedTags(tags);
        }
    }, [tags]);

    return (
        <Combobox
            allowMultiple
            activator={
                <Combobox.TextField
                    autoComplete="off"
                    label="Add tags"
                    labelHidden
                    value={value}
                    suggestion={suggestion}
                    placeholder="Add tags"
                    verticalContent={verticalContentMarkup}
                    onChange={setValue}
                    error={error}
                />
            }
        >
           {(actionMarkup || optionMarkup) && listboxMarkup}

        </Combobox>
    );
}

export default CreateMultiSelectComponent;