/**
 * MultiSelectComponent
 * 
 * This component provides a multi-select combobox functionality using Shopify's Polaris library. It allows users to search and select 
 * multiple options from a dropdown list, displaying the selected options as removable tags. The component also supports dynamic filtering 
 * of available options based on user input.
 * 
 * @param {string} fieldName - The name of the field associated with this multi-select component, used for identification in form handling.
 * @param {string} labelName - The label for the field, which is used as the placeholder in the search input.
 * @param {array} selectOptions - An array of available options for selection. Each option should be a string representing the tag.
 * @param {function} onValueChange - Callback function that is triggered when the selection changes. It receives an array of selected tags and the field name.
 * @param {array} [defaultValue] - An optional array of tags that should be selected by default when the component is first rendered.
 * 
 * @returns {JSX.Element} A multi-select combobox component with tagging functionality and dynamic search.
 */

import {
    InlineStack,
    Tag,
    Listbox,
    EmptySearchResult,
    Combobox,
    Text,
    AutoSelection,
    BlockStack
} from '@shopify/polaris';
import { useState, useCallback, useMemo, useEffect } from 'react';
import TextComponent from './TextComponent';

const MultiSelectComponent = ({ fieldName, labelName, selectOptions, onValueChange, defaultValue }) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [value, setValue] = useState('');
    const [suggestion, setSuggestion] = useState('');

    // Handles the active option change in the listbox
    const handleActiveOptionChange = useCallback(
        (activeOption) => {
            const activeOptionIsAction = activeOption === value;

            if (!activeOptionIsAction && !selectedTags.includes(activeOption)) {
                setSuggestion(activeOption);
            } else {
                setSuggestion('');
            }
        },
        [value, selectedTags],
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
            onValueChange([...nextSelectedTags], fieldName);
            setValue('');
            setSuggestion('');
        },
        [selectedTags, onValueChange, fieldName],
    );

    // Removes a tag from the selected tags
    const removeTag = useCallback(
        (tag) => () => {
            updateSelection(tag);
        },
        [updateSelection],
    );

    // Retrieves all available tags, combining selected tags with selectable options
    const getAllTags = useCallback(() => {
        const savedTags = selectOptions;
        return [...new Set([...savedTags, ...selectedTags].sort())];
    }, [selectedTags, selectOptions]);

    // Formats the display of options in the listbox, highlighting matching text
    const formatOptionText = useCallback(
        (option) => {
            const trimValue = value.trim().toLocaleLowerCase();
            const matchIndex = option.toLocaleLowerCase().indexOf(trimValue);

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
        [value],
    );

    // Escapes special characters in the input value to safely use it in regex
    const escapeSpecialRegExCharacters = useCallback(
        (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        [],
    );

    // Filters the available options based on the current input value
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

    // Renders selected tags in the combobox
    const verticalContentMarkup =
        selectedTags.length > 0 ? (
            <InlineStack spacing="extraTight" alignment="center" gap="200">
                {selectedTags.map((tag) => (
                    <Tag key={`option-${tag}`} onRemove={removeTag(tag)}>
                        {tag}
                    </Tag>
                ))}
            </InlineStack>
        ) : null;

    // Generates the markup for the options in the listbox
    const optionMarkup =
        options.length > 0
            ? options.map((option) => {
                return (
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
                );
            })
            : null;

    // Displays an empty state if no options match the input value
    const emptyStateMarkup = optionMarkup ? null : (
        <EmptySearchResult
            title=""
            description={`No tags found matching "${value}"`}
        />
    );

    // Combines the option and empty state markup for rendering in the combobox
    const listboxMarkup =
        optionMarkup || emptyStateMarkup ? (
            <Listbox
                autoSelection={AutoSelection.None}
                onSelect={updateSelection}
                onActiveOptionChange={handleActiveOptionChange}
            >
                {optionMarkup}
            </Listbox>
        ) : null;

    // Initializes the selected tags based on the default value when the component mounts
    useEffect(() => {
        if (defaultValue) {
            setSelectedTags(defaultValue)
        }
    }, [defaultValue]);

    return (
        <BlockStack gap="150">
            <TextComponent
                textTitle={labelName}
                textVariant="bodyMd"
                textAs="span"
            />
            <Combobox
                allowMultiple
                activator={
                    <Combobox.TextField
                        autoComplete="off"
                        labelHidden
                        suggestion={suggestion}
                        placeholder={`Search ${labelName}`}
                        verticalContent={verticalContentMarkup}
                        value={value}
                        onChange={setValue}
                    />
                }
            >
                {listboxMarkup}
            </Combobox>
        </BlockStack>
    );
}

export default MultiSelectComponent;