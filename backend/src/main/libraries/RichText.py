import re


def cleanup_script_array(content: str):
    if not content:
        return ""

    script = content.replace('*', '')
    first_lines = re.split(r'\r\n|\r|\n', script)
    first_count = len(first_lines)
    first_lines = [f.strip() for f in first_lines]
    second_lines = []

    copy_flag = False
    for line in first_lines:
        if len(line) >= 4:
            if line.upper()[0:4] == "EXT." or line.upper()[0:4] == "INT.":
                copy_flag = True
        if copy_flag:
            if "FADE OUT" not in line and "FADE TO BLACK" not in line and "CUT TO BLACK" not in line:
                second_lines.append(line)

    second_count = len(second_lines)
    shrink = 0.0

    if first_count > 0:
        shrink = float(second_count) / float(first_count)
    else:
        shrink = 0.25

    if shrink > 0.75:
        return second_lines

    return first_lines


def lower_alpha(input: str):
    for i in input:
        if i.isupper():
            return False
    return True


def is_speaker_candidate(input: str):
    input = input.strip()
    parens_location = input.find('(')
    if (parens_location > -1):
        input = input[0:parens_location]
    if len(input) > 0:
        if not lower_alpha(input):
            return True
    return False


def clean_speaker(input: str):
    if input:
        input = input.strip()
        input = input.replace(":", "")
        input = input.replace("\"", "")
        input = input.replace("'", "")
        input = input.replace("*", "")

        input = input.upper()

    return input


def is_parens(input: str):
    input = input.strip()
    if (input[0] == '(' and input[-1] == ')'):
        return True


def is_blank(input: str):
    if len(input.strip()) == 0:
        return True
    return False


def parit_left(input: str):
    return f"\r\n\r\n\\pard\\f0\\fs20\\ql {input} \\par\r\n\r\n"


def parit_center(input: str):
    return f"\r\n\r\n\\pard\\f0\\fs20\\qc\\li770\\ri770 {input} \\par\r\n\r\n"


def parit_indented(input: str):
    return f"\r\n\r\n\\pard\\f0\\fs20\\ql\\li770\\ri770 {input} \\par\r\n\r\n"


def make_rtf_blank():
    return "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Courier New;}}   }"


def assemble_formatted_from_script_array_rtf(script_lines):
    script = ""
    script_rtf = ""
    line_count = len(script_lines)
    next_line = ""

    in_dialog = False
    for j, current_line in enumerate(script_lines):
        if j + 1 < line_count:
            next_line = script_lines[j + 1]
        else:
            next_line = "***THEEND***"

        if (lower_alpha(current_line) and not is_speaker_candidate(current_line) and not in_dialog):
            script = script + parit_left(current_line)
        elif is_blank(current_line) and not in_dialog:
            script = script + parit_left("      ")
        elif is_speaker_candidate(current_line) and not in_dialog:
            if is_blank(next_line) and not in_dialog:
                script = script + parit_left(current_line)
            else:
                in_dialog = True
                current_line = clean_speaker(current_line)
                script = script + parit_center(current_line)
        elif not is_blank(current_line) and in_dialog:
            if is_parens(current_line):
                script = script + parit_center(current_line)
            else:
                script = script + parit_indented(current_line)
        elif is_blank(current_line) and in_dialog:
            script = script + parit_indented("    ")
            in_dialog = False
        elif in_dialog and next_line == "***THEEND***":
            script = script + parit_indented(current_line)
        elif not in_dialog and next_line == "***THEEND***":
            script = script + parit_left(current_line)
        else:
            script = script + parit_left(current_line)

    script_rtf = "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Courier New;}}" + "\r\n" + script + "}"

    return script_rtf
